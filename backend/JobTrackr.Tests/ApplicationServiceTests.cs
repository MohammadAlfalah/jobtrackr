using JobTrackr.Api.Data;
using JobTrackr.Api.Dtos;
using JobTrackr.Api.Models;
using JobTrackr.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace JobTrackr.Tests;

/// <summary>
/// Service tests backed by a real (in-memory) SQLite database, so the enum-to-string
/// conversion and the relational rules are exercised exactly as in production.
/// </summary>
public class ApplicationServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly ApplicationService _service;

    public ApplicationServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        // Seed two users so applications have a valid owner (the FK is enforced by SQLite).
        // A fresh database assigns them Id 1 and Id 2, which the tests below rely on.
        _db.Users.AddRange(
            new User { Email = "user1@test.com", PasswordHash = "x" },
            new User { Email = "user2@test.com", PasswordHash = "x" });
        _db.SaveChanges();

        _service = new ApplicationService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task Create_WithAppliedStatus_StampsAppliedOn()
    {
        var dto = new ApplicationCreateDto
        {
            Company = "Acme GmbH",
            Position = "Backend Intern",
            Status = ApplicationStatus.Applied
        };

        var created = await _service.CreateAsync(userId: 1, dto);

        Assert.NotNull(created.AppliedOn);
        Assert.Equal(ApplicationStatus.Applied, created.Status);
    }

    [Fact]
    public async Task Create_PastAppliedStatus_AlsoStampsAppliedOn()
    {
        // Back-filling an application directly as Interviewing implies it was submitted.
        var created = await _service.CreateAsync(1, new ApplicationCreateDto
        {
            Company = "Acme", Position = "Intern", Status = ApplicationStatus.Interviewing
        });

        Assert.NotNull(created.AppliedOn);
    }

    [Fact]
    public async Task Create_WishlistStatus_DoesNotStampAppliedOn()
    {
        var created = await _service.CreateAsync(1, new ApplicationCreateDto
        {
            Company = "Acme", Position = "Intern", Status = ApplicationStatus.Wishlist
        });

        Assert.Null(created.AppliedOn);
    }

    [Fact]
    public async Task GetAll_ReturnsOnlyTheCallersApplications()
    {
        await _service.CreateAsync(1, new ApplicationCreateDto { Company = "A", Position = "X" });
        await _service.CreateAsync(2, new ApplicationCreateDto { Company = "B", Position = "Y" });

        var user1 = await _service.GetAllAsync(userId: 1);

        Assert.Single(user1);
        Assert.Equal("A", user1[0].Company);
    }

    [Fact]
    public async Task GetAll_FiltersByStatus()
    {
        await _service.CreateAsync(1, new ApplicationCreateDto { Company = "A", Position = "X", Status = ApplicationStatus.Wishlist });
        await _service.CreateAsync(1, new ApplicationCreateDto { Company = "B", Position = "Y", Status = ApplicationStatus.Applied });

        var applied = await _service.GetAllAsync(1, ApplicationStatus.Applied);

        Assert.Single(applied);
        Assert.Equal("B", applied[0].Company);
    }

    [Fact]
    public async Task Update_WithIllegalTransition_IsRejected()
    {
        var app = await _service.CreateAsync(1, new ApplicationCreateDto
        {
            Company = "A", Position = "X", Status = ApplicationStatus.Rejected
        });

        var (ok, error) = await _service.UpdateAsync(1, app.Id, new ApplicationUpdateDto
        {
            Company = "A", Position = "X", Status = ApplicationStatus.Interviewing
        });

        Assert.False(ok);
        Assert.NotNull(error); // a message means "rejected", not "not found"
    }

    [Fact]
    public async Task Update_WithLegalTransition_Succeeds()
    {
        var app = await _service.CreateAsync(1, new ApplicationCreateDto
        {
            Company = "A", Position = "X", Status = ApplicationStatus.Applied
        });

        var (ok, error) = await _service.UpdateAsync(1, app.Id, new ApplicationUpdateDto
        {
            Company = "A", Position = "X", Status = ApplicationStatus.Interviewing
        });

        Assert.True(ok);
        Assert.Null(error);
    }

    [Fact]
    public async Task Update_AnotherUsersApplication_IsTreatedAsNotFound()
    {
        var app = await _service.CreateAsync(userId: 1, new ApplicationCreateDto { Company = "A", Position = "X" });

        // user 2 tries to edit user 1's application
        var (ok, error) = await _service.UpdateAsync(2, app.Id, new ApplicationUpdateDto { Company = "Hacked", Position = "X" });

        Assert.False(ok);
        Assert.Null(error); // null error == not found (no information leak about other users' data)
    }

    [Fact]
    public async Task GetStats_CountsTotalsAndPerStatus()
    {
        await _service.CreateAsync(1, new ApplicationCreateDto { Company = "A", Position = "X", Status = ApplicationStatus.Applied });
        await _service.CreateAsync(1, new ApplicationCreateDto { Company = "B", Position = "Y", Status = ApplicationStatus.Applied });
        await _service.CreateAsync(1, new ApplicationCreateDto { Company = "C", Position = "Z", Status = ApplicationStatus.Rejected });

        var stats = await _service.GetStatsAsync(1);

        Assert.Equal(3, stats.Total);
        Assert.Equal(2, stats.ByStatus["Applied"]);
        Assert.Equal(1, stats.ByStatus["Rejected"]);
        Assert.Equal(2, stats.ActiveCount); // 2 Applied are active; Rejected is terminal
    }
}
