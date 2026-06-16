using System.ComponentModel.DataAnnotations;
using JobTrackr.Api.Models;

namespace JobTrackr.Api.Dtos;

/// <summary>Payload for creating a new application.</summary>
public record ApplicationCreateDto
{
    [Required, MaxLength(120)]
    public string Company { get; init; } = string.Empty;

    [Required, MaxLength(120)]
    public string Position { get; init; } = string.Empty;

    [MaxLength(120)]
    public string? Location { get; init; }

    [EnumDataType(typeof(ApplicationStatus))]
    public ApplicationStatus Status { get; init; } = ApplicationStatus.Wishlist;

    public DateTime? AppliedOn { get; init; }

    [Url, MaxLength(500)]
    public string? Url { get; init; }

    [MaxLength(2000)]
    public string? Notes { get; init; }
}

/// <summary>Payload for updating an existing application (same shape as create).</summary>
public record ApplicationUpdateDto : ApplicationCreateDto;

/// <summary>What the API returns for an application.</summary>
public record ApplicationReadDto
{
    public int Id { get; init; }
    public string Company { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public string? Location { get; init; }
    public ApplicationStatus Status { get; init; }
    public DateTime? AppliedOn { get; init; }
    public string? Url { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static ApplicationReadDto FromEntity(JobApplication a) => new()
    {
        Id = a.Id,
        Company = a.Company,
        Position = a.Position,
        Location = a.Location,
        Status = a.Status,
        AppliedOn = a.AppliedOn,
        Url = a.Url,
        Notes = a.Notes,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
}
