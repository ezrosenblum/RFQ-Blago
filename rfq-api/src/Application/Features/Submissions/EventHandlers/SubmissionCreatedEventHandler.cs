using Application.Common.MessageBroker;
using Domain.Events.Submissions;
using DTO.MessageBroker.Messages.Submission;
using MediatR;

namespace Application.Features.Submissions.EventHandlers;

public sealed class SubmissionApprovedEventHandler : INotificationHandler<SubmissionApprovedEvent>
{
    private readonly IMessagePublisher _messagePublisher;
    public SubmissionApprovedEventHandler(
        IMessagePublisher messagePublisher)
    {
        _messagePublisher = messagePublisher;
    }

    public async Task Handle(SubmissionApprovedEvent eventData, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(new NewSubmissionMessage(eventData.Submission.Id), cancellationToken);
    }
}