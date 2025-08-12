using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;
using Domain.Events.Submissions.SubmissionQuotes.QuoteMessages;
using MediatR;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.EventHandlers;

public sealed class QuoteMessageUpdatedEventHandler : INotificationHandler<QuoteMessageUpdatedEvent>
{
    private readonly IMediator _mediatr;

    public QuoteMessageUpdatedEventHandler(
        IMediator mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Handle(QuoteMessageUpdatedEvent eventData, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new QuoteMessageIndexCommand(eventData.QuoteMessage.Id));
    }
}