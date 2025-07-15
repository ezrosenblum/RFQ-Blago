using Application.Common.Caching;
using Application.Features.Submissions.Commands;
using Domain.Events.Submissions;
using MediatR;

namespace Application.Features.Submissions.EventHandlers;

public sealed class SubmissionCreatedEventHandler : INotificationHandler<SubmissionCreatedEvent>
{
    private readonly IMediator _mediatr;

    public SubmissionCreatedEventHandler(
        IMediator mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Handle(SubmissionCreatedEvent eventData, CancellationToken cancellationToken)
    {

        await _mediatr.Send(new SubmissionRebuildSearchIndexCommand());
    }
}