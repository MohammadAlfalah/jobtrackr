namespace JobTrackr.Api.Dtos;

/// <summary>
/// Dashboard summary for the signed-in user.
/// </summary>
public record StatsDto
{
    /// <summary>Total number of applications.</summary>
    public int Total { get; init; }

    /// <summary>Count per status, keyed by the status name (e.g. "Applied": 12).</summary>
    public Dictionary<string, int> ByStatus { get; init; } = new();

    /// <summary>
    /// Share of "decided" applications (Offer/Accepted) that turned into a response
    /// versus rejections — a simple success signal for the dashboard.
    /// </summary>
    public int ActiveCount { get; init; }
}
