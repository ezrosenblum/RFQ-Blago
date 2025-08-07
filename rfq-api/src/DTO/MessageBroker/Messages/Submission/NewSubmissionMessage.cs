namespace DTO.MessageBroker.Messages.Submission;

public sealed record NewSubmissionMessage(int SubmissionId) : MessageBase;
