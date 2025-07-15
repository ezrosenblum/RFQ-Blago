using Application.Common.Caching;
using Application.Features.Submissions.Commands;
using Domain.Events.Submissions;
using MediatR;

namespace Application.Features.Submissions.EventHandlers;

public sealed class SubmissionUpdatedEventHandler : INotificationHandler<SubmissionUpdatedEvent>
{
    private readonly IMediator _mediatr;

    public SubmissionUpdatedEventHandler(
        IMediator mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Handle(SubmissionUpdatedEvent eventData, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new SubmissionIndexCommand(eventData.Submission.Id));
    }
}