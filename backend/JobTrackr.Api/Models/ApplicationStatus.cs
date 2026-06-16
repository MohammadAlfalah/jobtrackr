namespace JobTrackr.Api.Models;

/// <summary>
/// The lifecycle stages an internship/job application moves through.
/// Stored as a string in the database (see AppDbContext) so the data stays
/// readable and new stages can be added without breaking existing rows.
/// </summary>
public enum ApplicationStatus
{
    /// <summary>Saved but not applied to yet.</summary>
    Wishlist,

    /// <summary>Application has been submitted.</summary>
    Applied,

    /// <summary>In the interview / assessment process.</summary>
    Interviewing,

    /// <summary>An offer has been received.</summary>
    Offer,

    /// <summary>Offer accepted — the goal!</summary>
    Accepted,

    /// <summary>Application was rejected.</summary>
    Rejected,

    /// <summary>Withdrawn by the applicant.</summary>
    Withdrawn
}
