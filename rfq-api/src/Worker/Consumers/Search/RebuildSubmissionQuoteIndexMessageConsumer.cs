using Application.Features.Submissions.SubmissionQuotes.Commands;
using DTO.MessageBroker.Messages.Search;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Search;

public sealed class RebuildSubmissionQuoteIndexMessageConsumer : IConsumer<RebuildSubmissionQuoteIndexMessage>
{
    private readonly ISender _mediatr;

    public RebuildSubmissionQuoteIndexMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<RebuildSubmissionQuoteIndexMessage> context)
    {
        await _mediatr.Send(new SubmissionQuoteRebuildSearchIndexCommand());
    }
}