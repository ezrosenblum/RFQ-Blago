using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Microsoft.AspNetCore.Http;

namespace Domain.Events.Submissions.SubmissionQuotes.QuoteMessages;

public sealed class QuoteMessageCreatedEvent : BaseEvent
{
    public QuoteMessageCreatedEvent(QuoteMessage quoteMessage, List<IFormFile> media)
    {
        QuoteMessage = quoteMessage;
        Media = media;
    }
    public QuoteMessage QuoteMessage { get; } = null!;
    public List<IFormFile> Media { get; } = new();
}
