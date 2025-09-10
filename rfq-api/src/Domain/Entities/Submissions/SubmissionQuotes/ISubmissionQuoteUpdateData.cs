using DTO.Enums.Submission.SubmissionQuote;

namespace Domain.Entities.Submissions.SubmissionQuotes;

public interface ISubmissionQuoteUpdateData
{
    string Title { get; }
    string Description { get; }
    decimal Price { get; }
    SubmissionQuotePriceType? PriceType { get; }
    string? PriceTypeOther { get; }
    GlobalIntervalType QuoteValidityIntervalType { get; }
    int QuoteValidityInterval { get; }
    string? TimelineDescription { get; }
    }
