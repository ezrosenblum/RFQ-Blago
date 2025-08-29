using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;
using DTO.MessageBroker.Messages.Search;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Search;

public sealed class IndexQuoteMessageMessageConsumer : IConsumer<IndexQuoteMessageMessage>
{
    private readonly ISender _mediatr;

    public IndexQuoteMessageMessageConsumer(
        ISender mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Consume(ConsumeContext<IndexQuoteMessageMessage> context)
    {
        await _mediatr.Send(new QuoteMessageIndexCommand(context.Message.QuoteMessageId));
    }
}