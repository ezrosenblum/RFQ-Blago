namespace DTO.Submission.Report;

public sealed record StatusDistributionData
{
    public string StatusName { get; init; } = string.Empty;
    public int Count { get; init; }
    public decimal Percentage { get; init; }
}

public sealed record StatusDistributionResponse
{
    public IReadOnlyCollection<StatusDistributionData> StatusDistribution { get; init; } = new List<StatusDistributionData>();
}