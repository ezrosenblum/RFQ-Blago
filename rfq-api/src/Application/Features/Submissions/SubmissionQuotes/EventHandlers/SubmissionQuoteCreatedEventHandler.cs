using Application.Common.MessageBroker;
using Application.Features.Submissions.Commands;
using Application.Features.Submissions.SubmissionQuotes.Commands;
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
        if (eventData.Media != null)
        {
            foreach (var file in eventData.Media)
            {
                await _mediatr.Send(new SubmissionQuoteFileUploadCommand(eventData.SubmissionQuote.Id, file));
            }
        }

        await _mediatr.Send(new SubmissionQuoteIndexCommand(eventData.SubmissionQuote.Id), cancellationToken);

        await _mediatr.Send(new SubmissionIndexCommand(eventData.SubmissionQuote.SubmissionId), cancellationToken);

        await _messagePublisher.PublishAsync(new NewSubmissionQuoteMessage(eventData.SubmissionQuote.Id), cancellationToken);
    }
}
