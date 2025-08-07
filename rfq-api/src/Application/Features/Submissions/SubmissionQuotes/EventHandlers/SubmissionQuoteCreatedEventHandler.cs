using Application.Common.MessageBroker;
using Application.Features.Submissions.Commands;
using Domain.Events.Submissions.SubmissionQuotes;
using DTO.MessageBroker.Messages.Submission.Quote;
using MediatR;

namespace Application.Features.Submissions.SubmissionQuotes.EventHandlers;

public sealed class SubmissionQuoteCreatedEventHandler : INotificationHandler<SubmissionQuoteCreatedEvent>
{
    private readonly ISender _mediatr;
    private readonly IMessagePublisher _messagePublisher;

    public SubmissionQuoteCreatedEventHandler(
        ISender mediatr,
        IMessagePublisher messagePublisher)
    {
        _mediatr = mediatr;
        _messagePublisher = messagePublisher;
    }

    public async Task Handle(SubmissionQuoteCreatedEvent eventData, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new SubmissionQuoteIndexCommand(eventData.SubmissionQuote.Id));

        await _messagePublisher.PublishAsync(new NewSubmissionQuoteMessage(eventData.SubmissionQuote.Id), cancellationToken);
    }
}
