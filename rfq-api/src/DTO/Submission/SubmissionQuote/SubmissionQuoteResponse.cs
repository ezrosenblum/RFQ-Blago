using DTO.Submission.SubmissionQuote.QuoteMessage;

namespace DTO.Submission.SubmissionQuote;

public record SubmissionQuoteResponse : SubmissionQuoteBaseResponse
{
    public SubmissionBaseResponse Submission { get; init; } = new();
    public QuoteMessageResponse? LastMessage { get; init; }
}
