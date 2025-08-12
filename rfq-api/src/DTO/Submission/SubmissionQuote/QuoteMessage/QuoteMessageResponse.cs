using DTO.Enums.Submission.SubmissionQuote.QuoteMessage;
using DTO.Medias;
using DTO.Response;
using DTO.User;

namespace DTO.Submission.SubmissionQuote.QuoteMessage;

public record QuoteMessageResponse
{
    public int Id { get; init; }
    public string Content { get; init; } = null!;
    public int SubmissionQuoteId { get; init; }
    public int SenderId { get; init; }
    public DateTime Created { get; init; }
    public ListItemBaseResponse QuoteMessageStatus { get; init; } = new();
    public MediaResponse Media { get; private set; } = null!;
    public UserBaseResponse Sender { get; private set; } = null!;
}
