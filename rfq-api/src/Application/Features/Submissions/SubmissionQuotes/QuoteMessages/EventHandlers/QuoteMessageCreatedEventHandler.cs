using Application.Common.MessageBroker;
using Application.Features.QuoteMessages.QuoteMessageQuotes.QuoteMessages.Commands;
using Application.Features.Submissions.Commands;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;
using Domain.Events.Submissions.SubmissionQuotes.QuoteMessages;
using DTO.MessageBroker.Messages.Submission.SubmissionQuote.QuoteMessage;
using MediatR;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.EventHandlers;

public sealed class QuoteMessageCreatedEventHandler : INotificationHandler<QuoteMessageCreatedEvent>
{
    private readonly ISender _mediatr;
    private readonly IMessagePublisher _messagePublisher;

    public QuoteMessageCreatedEventHandler(
        ISender mediatr,
        IMessagePublisher messagePublisher)
    {
        _mediatr = mediatr;
        _messagePublisher = messagePublisher;
    }

    public async Task Handle(QuoteMessageCreatedEvent eventData, CancellationToken cancellationToken)
    {
        if (eventData.Media != null)
        {
            foreach (var file in eventData.Media)
            {
                await _mediatr.Send(new QuoteMessageFileUploadCommand(eventData.QuoteMessage.Id, file));
            }
        }
        await _mediatr.Send(new SubmissionQuoteIndexCommand(eventData.QuoteMessage.SubmissionQuoteId));

        await _mediatr.Send(new QuoteMessageIndexCommand(eventData.QuoteMessage.Id));

        await _messagePublisher.PublishAsync(new NewQuoteMessageMessage(eventData.QuoteMessage.Id), cancellationToken);
    }
}
