using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;
using DTO.MessageBroker.Messages.Search;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Search;

public sealed class RebuildQuoteMessageIndexMessageConsumer : IConsumer<RebuildQuoteMessageIndexMessage>
{
    private readonly ISender _mediatr;

    public RebuildQuoteMessageIndexMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<RebuildQuoteMessageIndexMessage> context)
    {
        await _mediatr.Send(new QuoteMessageRebuildSearchIndexCommand());
    }
}