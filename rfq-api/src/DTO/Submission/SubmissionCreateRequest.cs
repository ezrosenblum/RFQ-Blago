using DTO.Enums.Submission;

namespace DTO.Submission;

public sealed record SubmissionCreateRequest
{
    public string Description { get; init; } = null!;
    public int Quantity { get; init; }
    public SubmissionUnit Unit { get; init; }
    public string JobLocation { get; init; } = null!;
}
