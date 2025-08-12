using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;

namespace Domain.Events.Submissions.SubmissionQuotes.QuoteMessages;

public sealed class QuoteMessageSeenEvent : BaseEvent
{
    public QuoteMessageSeenEvent(QuoteMessage quoteMessage)
    {
        QuoteMessage = quoteMessage;
    }
    public QuoteMessage QuoteMessage { get; }
}
