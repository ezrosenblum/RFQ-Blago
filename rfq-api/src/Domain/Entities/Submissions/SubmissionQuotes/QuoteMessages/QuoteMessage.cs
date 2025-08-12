using Domain.Entities.Base;
using Domain.Entities.Medias;
using Domain.Entities.User;
using Domain.Events;
using Domain.Events.Submissions.SubmissionQuotes.QuoteMessages;
using DTO.Enums.Media;
using DTO.Enums.Submission.SubmissionQuote.QuoteMessage;
using Microsoft.AspNetCore.Http;

namespace Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;

public class QuoteMessage : BaseAuditableEntity, IHasDomainEvents, IWithMedia
{
    public string? Content { get; private set; }
    public int SubmissionQuoteId { get; private set; }
    public int SenderId { get; private set; }
    public QuoteMessageStatus QuoteMessageStatus { get; private set; } = QuoteMessageStatus.Sent;

    public Media Media { get; private set; } = null!;

    public ApplicationUser Sender { get; private set; } = null!;
    public SubmissionQuote SubmissionQuote { get; private set; } = null!;

    private QuoteMessage() { }

    private QuoteMessage(
        IQuoteMessageInsertData data,
        List<IFormFile> files)
    {
        Content = data.Content;
        SubmissionQuoteId = data.SubmissionQuoteId;
        SenderId = data.SenderId;

        Media = new Media(MediaEntityType.QuoteMessage);

        AddDomainEvent(new QuoteMessageCreatedEvent(this, files));
    }

    public static QuoteMessage Create(
        IQuoteMessageInsertData data,
        List<IFormFile> files)
    {
        return new QuoteMessage(data, files);
    }

    public void MarkAsSeen()
    {
        QuoteMessageStatus = QuoteMessageStatus.Seen;
        AddDomainEvent(new QuoteMessageUpdatedEvent(this));
        AddDomainEvent(new QuoteMessageSeenEvent(this));
    }
}
