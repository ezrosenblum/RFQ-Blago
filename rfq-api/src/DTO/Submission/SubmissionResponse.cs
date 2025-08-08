using DTO.Response;
using DTO.Submission.SubmissionQuote;
using DTO.Submission.SubmissionStatusHistory;

namespace DTO.Submission;

public record SubmissionResponse : SubmissionBaseResponse
{
    public IReadOnlyCollection<SubmissionQuoteBaseResponse> Quotes { get; init; } = new List<SubmissionQuoteBaseResponse>();
    public List<SubmissionStatusHistoryResponse> StatusHistory { get; set; } = new();
    public ListItemBaseResponse? VendorStatus { get; set; }
    public List<SubmissionStatusHistoryCountResponse> StatusHistoryCount { get; set; } = new();
}
