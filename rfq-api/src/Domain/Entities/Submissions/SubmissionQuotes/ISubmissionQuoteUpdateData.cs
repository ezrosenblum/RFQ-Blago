using DTO.Enums.Submission.SubmissionQuote;

namespace Domain.Entities.Submissions.SubmissionQuotes;

public interface ISubmissionQuoteUpdateData
{
    string Title { get; }
    string Description { get; }
    decimal Price { get; }
    GlobalIntervalType QuoteValidityIntervalType { get; }
    int QuoteValidityInterval { get; }
    GlobalIntervalType? TimelineIntervalType { get; }
    int? MinimumTimelineDuration { get; }
    int? MaximumTimelineDuration { get; }
    GlobalIntervalType? WarantyIntervalType { get; }
    int? WarantyDuration { get; }

}
