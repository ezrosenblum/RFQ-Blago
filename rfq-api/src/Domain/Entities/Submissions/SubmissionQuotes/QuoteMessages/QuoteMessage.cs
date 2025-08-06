using Domain.Entities.Base;
using Domain.Entities.Medias;
using Domain.Events;
using DTO.Enums.Submission.SubmissionQuote.QuoteMessage;

namespace Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;

public class QuoteMessage : BaseAuditableEntity, IHasDomainEvents, IWithMedia
{
    public string Content { get; private set; } = null!;
    public int SubmissionQuoteId { get; private set; }
    public QuoteMessageStatus QuoteStatus { get; private set; } = QuoteMessageStatus.Sent;

    public Media Media { get; private set; } = null!;

    public SubmissionQuote SubmissionQuote { get; private set; } = null!;

    private QuoteMessage() { }
}
