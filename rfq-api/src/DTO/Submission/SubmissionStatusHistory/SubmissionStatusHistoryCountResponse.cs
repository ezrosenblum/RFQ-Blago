using DTO.Enums.Submission;
using DTO.Response;

namespace DTO.Submission.SubmissionStatusHistory;

public sealed record SubmissionStatusHistoryCountResponse
{
    public int Count { get; init; }
    public ListItemBaseResponse Status { get; init; } = new();
}
