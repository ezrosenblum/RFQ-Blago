namespace DTO.Submission.Report;

public sealed record StatusDistributionResponse
{
    public IReadOnlyCollection<StatusDistributionData> StatusDistribution { get; init; } = new List<StatusDistributionData>();
}
