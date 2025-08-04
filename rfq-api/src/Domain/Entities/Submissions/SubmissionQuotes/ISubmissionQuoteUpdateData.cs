using DTO.Enums.Submission.SubmissionQuote;

namespace Domain.Entities.Submissions.SubmissionQuotes;

public interface ISubmissionQuoteUpdateData
{
    string Title { get; }
    string Description { get; }
    decimal Price { get; }
    SubmissionQuoteValidityIntervalType QuoteValidityIntervalType { get; }
    int QuoteValidityInterval { get; }
}
