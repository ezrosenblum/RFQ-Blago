namespace DTO.Notification;

public sealed record NewQuoteMessageData
{
    public int SubmissionQuoteId { get; init; }
    public int QuoteMessageId { get; init; }
}
