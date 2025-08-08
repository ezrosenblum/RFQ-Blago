using DTO.Enums.Submission;

namespace Domain.Primitives;

public sealed class StatusHistory
{
    public SubmissionStatusHistoryType Status { get; init; }
    public int VendorId { get; init; }
    public DateTime DateCreated { get; init; }
}
