using DTO.Response;
using DTO.User;

namespace DTO.Submission.SubmissionQuote;

public record SubmissionQuoteResponse : SubmissionQuoteBaseResponse
{
    public SubmissionBaseResponse Submission { get; init; } = new();
}
