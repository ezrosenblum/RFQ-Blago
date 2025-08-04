using Application.Features.Submissions.Commands;
using Domain.Events.Submissions.SubmissionQuotes;
using MediatR;

namespace Application.Features.Submissions.SubmissionQuotes.EventHandlers;

public sealed class SubmissionQuoteUpdatedEventHandler : INotificationHandler<SubmissionQuoteUpdatedEvent>
{
    private readonly IMediator _mediatr;

    public SubmissionQuoteUpdatedEventHandler(
        IMediator mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Handle(SubmissionQuoteUpdatedEvent eventData, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new SubmissionQuoteIndexCommand(eventData.SubmissionQuote.Id));
    }
}