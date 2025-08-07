namespace DTO.MessageBroker.Messages.Submission;

public sealed record SubmissionAlertForNewMessage(
    int SubmissionId, 
    string FirstName, 
    string LastName,
    string Email) : MessageBase;