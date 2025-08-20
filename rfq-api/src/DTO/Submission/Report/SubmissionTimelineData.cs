namespace DTO.Submission.Report;

public sealed record SubmissionTimelineData
{
    public DateTime Date { get; init; }
    public int SubmissionsCount { get; init; }
    public int CompletedCount { get; init; }
    public decimal CompletionRate { get; init; }
}

public sealed record SubmissionTimelineResponse
{
    public IReadOnlyCollection<SubmissionTimelineData> Timeline { get; init; } = new List<SubmissionTimelineData>();
}