using JobTrackr.Api.Models;
using JobTrackr.Api.Services;
using Xunit;

namespace JobTrackr.Tests;

public class StatusWorkflowTests
{
    [Theory]
    [InlineData(ApplicationStatus.Wishlist, ApplicationStatus.Applied)]
    [InlineData(ApplicationStatus.Applied, ApplicationStatus.Interviewing)]
    [InlineData(ApplicationStatus.Interviewing, ApplicationStatus.Offer)]
    [InlineData(ApplicationStatus.Offer, ApplicationStatus.Accepted)]
    public void IsAllowed_PermitsForwardSteps(ApplicationStatus from, ApplicationStatus to)
        => Assert.True(StatusWorkflow.IsAllowed(from, to));

    [Theory]
    [InlineData(ApplicationStatus.Rejected, ApplicationStatus.Interviewing)]
    [InlineData(ApplicationStatus.Accepted, ApplicationStatus.Applied)]
    [InlineData(ApplicationStatus.Wishlist, ApplicationStatus.Offer)]
    [InlineData(ApplicationStatus.Withdrawn, ApplicationStatus.Applied)]
    public void IsAllowed_BlocksIllegalJumps(ApplicationStatus from, ApplicationStatus to)
        => Assert.False(StatusWorkflow.IsAllowed(from, to));

    [Fact]
    public void IsAllowed_SameStatus_IsAllowed_SoOtherFieldsCanBeEdited()
        => Assert.True(StatusWorkflow.IsAllowed(ApplicationStatus.Applied, ApplicationStatus.Applied));
}
