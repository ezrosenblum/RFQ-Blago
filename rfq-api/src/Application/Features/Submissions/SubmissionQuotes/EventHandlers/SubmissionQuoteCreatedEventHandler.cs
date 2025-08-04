using Application.Features.Submissions.Commands;
using Domain.Events.Submissions.SubmissionQuotes;
using MediatR;

namespace Application.Features.Submissions.SubmissionQuotes.EventHandlers;

public sealed class SubmissionQuoteCreatedEventHandler : INotificationHandler<SubmissionQuoteCreatedEvent>
{
    private readonly ISender _mediatr;

    public SubmissionQuoteCreatedEventHandler(ISender mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Handle(SubmissionQuoteCreatedEvent eventData, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new SubmissionQuoteIndexCommand(eventData.SubmissionQuote.Id));
    }
}
