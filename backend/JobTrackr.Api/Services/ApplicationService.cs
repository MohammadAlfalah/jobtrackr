using JobTrackr.Api.Data;
using JobTrackr.Api.Dtos;
using JobTrackr.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTrackr.Api.Services;

public interface IApplicationService
{
    Task<List<ApplicationReadDto>> GetAllAsync(int userId, ApplicationStatus? status = null);
    Task<ApplicationReadDto?> GetAsync(int userId, int id);
    Task<ApplicationReadDto> CreateAsync(int userId, ApplicationCreateDto dto);
    Task<(bool ok, string? error)> UpdateAsync(int userId, int id, ApplicationUpdateDto dto);
    Task<bool> DeleteAsync(int userId, int id);
    Task<StatsDto> GetStatsAsync(int userId);
}

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _db;
    public ApplicationService(AppDbContext db) => _db = db;

    // A status that means the application has actually been submitted (so AppliedOn
    // should be set). Everything past Wishlist except a pre-application Withdrawal.
    private static bool ImpliesSubmitted(ApplicationStatus s) =>
        s is ApplicationStatus.Applied
            or ApplicationStatus.Interviewing
            or ApplicationStatus.Offer
            or ApplicationStatus.Accepted
            or ApplicationStatus.Rejected;

    public async Task<List<ApplicationReadDto>> GetAllAsync(int userId, ApplicationStatus? status = null)
    {
        var query = _db.Applications.Where(a => a.UserId == userId);
        if (status is not null)
            query = query.Where(a => a.Status == status);

        return await query
            .OrderByDescending(a => a.UpdatedAt)
            .Select(a => ApplicationReadDto.FromEntity(a))
            .ToListAsync();
    }

    public async Task<ApplicationReadDto?> GetAsync(int userId, int id)
    {
        var app = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        return app is null ? null : ApplicationReadDto.FromEntity(app);
    }

    // A new application may be created in ANY real-world status by design: users
    // back-fill applications they have already submitted, are interviewing for, or
    // were rejected from. The StatusWorkflow state machine governs *transitions*
    // between states (see UpdateAsync), not the initial state chosen at creation.
    public async Task<ApplicationReadDto> CreateAsync(int userId, ApplicationCreateDto dto)
    {
        var app = new JobApplication
        {
            UserId = userId,
            Company = dto.Company,
            Position = dto.Position,
            Location = dto.Location,
            Status = dto.Status,
            Url = dto.Url,
            Notes = dto.Notes,
            // Stamp the applied date whenever the starting status implies the
            // application was already submitted (anything past Wishlist), so an
            // app created directly as e.g. Interviewing doesn't have a null AppliedOn.
            AppliedOn = dto.AppliedOn ?? (ImpliesSubmitted(dto.Status) ? DateTime.UtcNow : null)
        };

        _db.Applications.Add(app);
        await _db.SaveChangesAsync();
        return ApplicationReadDto.FromEntity(app);
    }

    public async Task<(bool ok, string? error)> UpdateAsync(int userId, int id, ApplicationUpdateDto dto)
    {
        var app = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (app is null) return (false, null); // not found

        if (!StatusWorkflow.IsAllowed(app.Status, dto.Status))
            return (false, $"Cannot move an application from {app.Status} to {dto.Status}.");

        // Stamp AppliedOn the first time it moves into Applied.
        if (app.Status != ApplicationStatus.Applied
            && dto.Status == ApplicationStatus.Applied
            && app.AppliedOn is null)
        {
            app.AppliedOn = DateTime.UtcNow;
        }

        app.Company = dto.Company;
        app.Position = dto.Position;
        app.Location = dto.Location;
        app.Status = dto.Status;
        app.Url = dto.Url;
        app.Notes = dto.Notes;
        if (dto.AppliedOn is not null) app.AppliedOn = dto.AppliedOn;
        app.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var app = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (app is null) return false;

        _db.Applications.Remove(app);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<StatsDto> GetStatsAsync(int userId)
    {
        var apps = await _db.Applications
            .Where(a => a.UserId == userId)
            .ToListAsync();

        var byStatus = apps
            .GroupBy(a => a.Status)
            .ToDictionary(g => g.Key.ToString(), g => g.Count());

        // "Active" = still in play (not a terminal state).
        var active = apps.Count(a =>
            a.Status is ApplicationStatus.Wishlist
                or ApplicationStatus.Applied
                or ApplicationStatus.Interviewing
                or ApplicationStatus.Offer);

        return new StatsDto
        {
            Total = apps.Count,
            ByStatus = byStatus,
            ActiveCount = active
        };
    }
}
