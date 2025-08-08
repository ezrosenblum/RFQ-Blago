using DTO.Response;

namespace DTO.Submission.SubmissionStatusHistory;

public class SubmissionStatusHistoryResponse
{
    public int VendorId { get; init; }
    public DateTime DateCreated { get; init; }
    public ListItemBaseResponse Status { get; init; } = new();
}
