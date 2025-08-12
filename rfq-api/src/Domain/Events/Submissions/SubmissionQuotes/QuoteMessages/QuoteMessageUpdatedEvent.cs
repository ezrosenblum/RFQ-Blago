using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;

namespace Domain.Events.Submissions.SubmissionQuotes.QuoteMessages;

public sealed class QuoteMessageUpdatedEvent : BaseEvent
{
    public QuoteMessageUpdatedEvent(QuoteMessage quoteMessage)
    {
        QuoteMessage = quoteMessage;
    }
    public QuoteMessage QuoteMessage { get; } = null!;
}