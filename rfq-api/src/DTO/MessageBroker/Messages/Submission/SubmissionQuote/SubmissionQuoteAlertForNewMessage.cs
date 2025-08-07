namespace DTO.MessageBroker.Messages.Submission.SubmissionQuote;

public sealed record SubmissionQuoteAlertForNewMessage(
    int SubmissionQuoteId,
    string FirstName,
    string LastName,
    string Email) : MessageBase;
