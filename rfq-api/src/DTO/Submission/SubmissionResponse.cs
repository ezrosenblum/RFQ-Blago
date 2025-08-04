using DTO.Submission.SubmissionQuote;

namespace DTO.Submission;

public record SubmissionResponse : SubmissionBaseResponse
{
    public IReadOnlyCollection<SubmissionQuoteBaseResponse> Quotes { get; init; } = new List<SubmissionQuoteBaseResponse>();
}
