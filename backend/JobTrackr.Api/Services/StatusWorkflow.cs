using JobTrackr.Api.Models;

namespace JobTrackr.Api.Services;

/// <summary>
/// Defines which application-status changes are allowed.
///
/// Modelling this as an explicit state machine (instead of letting any status jump
/// to any other) keeps the data honest: e.g. an application that was "Rejected"
/// shouldn't silently flip back to "Interviewing". The dashboard stats are only
/// meaningful if the transitions are meaningful.
///
/// ── This is the main business-rule of the app and is intentionally easy to change. ──
/// Edit the <see cref="Allowed"/> map below to model the hiring process the way you
/// actually experience it.
/// </summary>
public static class StatusWorkflow
{
    /// <summary>
    /// For each status, the set of statuses it is allowed to move to.
    /// Terminal states (Accepted / Rejected / Withdrawn) map to an empty set.
    /// </summary>
    private static readonly IReadOnlyDictionary<ApplicationStatus, ApplicationStatus[]> Allowed =
        new Dictionary<ApplicationStatus, ApplicationStatus[]>
        {
            [ApplicationStatus.Wishlist] = new[]
            {
                ApplicationStatus.Applied, ApplicationStatus.Withdrawn
            },
            [ApplicationStatus.Applied] = new[]
            {
                ApplicationStatus.Interviewing, ApplicationStatus.Offer,
                ApplicationStatus.Rejected, ApplicationStatus.Withdrawn
            },
            [ApplicationStatus.Interviewing] = new[]
            {
                ApplicationStatus.Offer, ApplicationStatus.Rejected, ApplicationStatus.Withdrawn
            },
            [ApplicationStatus.Offer] = new[]
            {
                ApplicationStatus.Accepted, ApplicationStatus.Rejected, ApplicationStatus.Withdrawn
            },
            [ApplicationStatus.Accepted] = Array.Empty<ApplicationStatus>(),
            [ApplicationStatus.Rejected] = Array.Empty<ApplicationStatus>(),
            [ApplicationStatus.Withdrawn] = Array.Empty<ApplicationStatus>(),
        };

    /// <summary>
    /// True if <paramref name="from"/> may transition to <paramref name="to"/>.
    /// Staying on the same status is always allowed (so the user can edit other
    /// fields without being forced to change status).
    /// </summary>
    public static bool IsAllowed(ApplicationStatus from, ApplicationStatus to)
    {
        if (from == to) return true;
        return Allowed.TryGetValue(from, out var targets) && targets.Contains(to);
    }
}
