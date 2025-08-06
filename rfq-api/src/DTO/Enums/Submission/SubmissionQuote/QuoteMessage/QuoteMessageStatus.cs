using DTO.Attributes;

namespace DTO.Enums.Submission.SubmissionQuote.QuoteMessage;

public enum QuoteMessageStatus
{
    [LocalizationKey("enum.quoteMessage.status.sent")]
    Sent = 1,
    [LocalizationKey("enum.quoteMessage.status.seen")]
    Seen = 2
}
