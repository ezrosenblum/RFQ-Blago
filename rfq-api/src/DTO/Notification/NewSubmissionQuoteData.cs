namespace DTO.Notification;

public sealed record NewSubmissionQuoteData
{
    public int SubmissionId { get; init; }
    public int QuoteId { get; init; }
}
