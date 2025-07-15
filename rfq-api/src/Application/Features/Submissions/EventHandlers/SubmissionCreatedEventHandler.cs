using Application.Common.Caching;
using Application.Features.Submissions.Commands;
using Domain.Events.Submissions;
using MediatR;

namespace Application.Features.Submissions.EventHandlers;

public sealed class SubmissionCreatedEventHandler : INotificationHandler<SubmissionCreatedEvent>
{
    private readonly ICacheService _cacheService;
    private readonly IMediator _mediatr;

    public SubmissionCreatedEventHandler(
        ICacheService cacheService,
        IMediator mediatr)
    {
        _cacheService = cacheService;
        _mediatr = mediatr;
    }

    public async Task Handle(SubmissionCreatedEvent eventData, CancellationToken cancellationToken)
    {
        await _cacheService.RemoveAsync(CacheKeys.AllSubmissions, cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.SubmissionsReport, cancellationToken);

        await _mediatr.Send(new SubmissionRebuildSearchIndexCommand());
    }
}