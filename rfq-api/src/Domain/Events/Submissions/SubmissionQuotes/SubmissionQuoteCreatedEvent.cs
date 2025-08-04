using Domain.Entities.Submissions.SubmissionQuotes;

namespace Domain.Events.Submissions.SubmissionQuotes;

public sealed class SubmissionQuoteCreatedEvent : BaseEvent
{
    public SubmissionQuoteCreatedEvent(SubmissionQuote submissionQuote)
    {
        SubmissionQuote = submissionQuote;
    }

    public SubmissionQuote SubmissionQuote { get;  } = null!;
}
