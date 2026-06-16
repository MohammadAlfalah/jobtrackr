namespace JobTrackr.Api.Models;

/// <summary>
/// An authenticated user. Each user only ever sees their own applications.
/// </summary>
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;

    /// <summary>BCrypt hash — the plain-text password is never stored.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
