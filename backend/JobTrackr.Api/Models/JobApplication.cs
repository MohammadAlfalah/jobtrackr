namespace JobTrackr.Api.Models;

/// <summary>
/// A single internship/job application tracked by a user.
/// </summary>
public class JobApplication
{
    public int Id { get; set; }

    // Owner — used to scope every query so users never see each other's data.
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Company { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;

    /// <summary>City / "Remote" — handy when filtering by location in Germany.</summary>
    public string? Location { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Wishlist;

    /// <summary>When the application was actually submitted (null while in Wishlist).</summary>
    public DateTime? AppliedOn { get; set; }

    /// <summary>Link to the job posting.</summary>
    public string? Url { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
