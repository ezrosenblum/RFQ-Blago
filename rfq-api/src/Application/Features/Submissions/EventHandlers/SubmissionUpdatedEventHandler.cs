using Application.Common.Caching;
using Application.Features.Submissions.Commands;
using Domain.Events.Submissions;
using MediatR;

namespace Application.Features.Submissions.EventHandlers;

public sealed class SubmissionUpdatedEventHandler : INotificationHandler<SubmissionUpdatedEvent>
{
    private readonly ICacheService _cacheService;
    private readonly IMediator _mediatr;

    public SubmissionUpdatedEventHandler(
        ICacheService cacheService,
        IMediator mediatr)
    {
        _cacheService = cacheService;
        _mediatr = mediatr;
    }

    public async Task Handle(SubmissionUpdatedEvent eventData, CancellationToken cancellationToken)
    {
        await _cacheService.RemoveAsync($"{CacheKeys.Submission}-{eventData.Submission.Id}", cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.SubmissionsReport, cancellationToken);
        await _cacheService.RemoveAsync(CacheKeys.AllSubmissions, cancellationToken);

        await _mediatr.Send(new SubmissionIndexCommand(eventData.Submission.Id));
    }
}