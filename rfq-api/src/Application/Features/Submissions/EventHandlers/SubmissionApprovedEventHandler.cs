using Application.Common.MessageBroker;
using Application.Features.Submissions.Commands;
using Domain.Events.Submissions;
using MediatR;

namespace Application.Features.Submissions.EventHandlers;

public sealed class SubmissionCreatedEventHandler : INotificationHandler<SubmissionCreatedEvent>
{
    private readonly IMediator _mediatr;
    private readonly IMessagePublisher _messagePublisher;
    public SubmissionCreatedEventHandler(
        IMediator mediatr,
        IMessagePublisher messagePublisher)
    {
        _mediatr = mediatr;
        _messagePublisher = messagePublisher;
    }

    public async Task Handle(SubmissionCreatedEvent eventData, CancellationToken cancellationToken)
    {
        if (eventData.Files != null)
        {
            foreach (var file in eventData.Files)
            {
                await _mediatr.Send(new SubmissionFileUploadCommand(eventData.Submission.Id, file));
            }
        }

        await _mediatr.Send(new SubmissionRebuildSearchIndexCommand());
    }
}