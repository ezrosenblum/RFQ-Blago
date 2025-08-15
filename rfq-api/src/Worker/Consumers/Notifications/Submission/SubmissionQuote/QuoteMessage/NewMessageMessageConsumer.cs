using Application.Features.QuoteMessages.QuoteMessageQuotes.QuoteMessages.Commands;
using DTO.MessageBroker.Messages.Submission.SubmissionQuote.QuoteMessage;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Notifications.Submission.SubmissionQuote.QuoteMessage;

public sealed class NewQuoteMessageMessageConsumer : IConsumer<NewQuoteMessageMessage>
{
    private readonly ISender _mediatr;

    public NewQuoteMessageMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<NewQuoteMessageMessage> context)
    {
        await _mediatr.Send(new QuoteMessageAlertForNewCommand(context.Message.QuoteMessageId), context.CancellationToken);
    }
}