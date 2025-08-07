using Application.Features.Submissions.SubmissionQuotes.Commands;
using DTO.MessageBroker.Messages.Submission.Quote;
using MassTransit;
using MediatR;

namespace NotificationService.Consumers.Submission.SubmissionQuote;

public sealed class NewSubmissionQuoteMessageConsumer : IConsumer<NewSubmissionQuoteMessage>
{
    private readonly ISender _mediatr;

    public NewSubmissionQuoteMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<NewSubmissionQuoteMessage> context)
    {
        await _mediatr.Send(new SubmissionQuoteAlertForNewCommand(context.Message.QuoteId), context.CancellationToken);
    }
}
