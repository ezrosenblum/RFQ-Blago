namespace DTO.Submission.Report;

public sealed record SubmissionTimelineResponse
{
    public IReadOnlyCollection<SubmissionTimelineData> Timeline { get; init; } = new List<SubmissionTimelineData>();
}