using Domain.Entities.Submissions.SubmissionQuotes;

namespace Domain.Events.Submissions.SubmissionQuotes;

public sealed class SubmissionQuoteUpdatedEvent : BaseEvent
{
    public SubmissionQuoteUpdatedEvent(SubmissionQuote submissionQuote)
    {
        SubmissionQuote = submissionQuote;
    }

    public SubmissionQuote SubmissionQuote { get; } = null!;

}
