namespace Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;

public interface IQuoteMessageInsertData
{
    int SenderId { get; }
    string? Content { get; }
    int SubmissionQuoteId { get; }
}
