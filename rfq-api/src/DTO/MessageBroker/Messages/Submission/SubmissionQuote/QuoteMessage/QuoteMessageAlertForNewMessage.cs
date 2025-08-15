namespace DTO.MessageBroker.Messages.Submission.SubmissionQuote.QuoteMessage;

public sealed record QuoteMessageAlertForNewMessage(
    int SubmissionQuoteId,
    int QuoteMessageId,
    string FirstName,
    string LastName,
    string Email) : MessageBase;
