using Application.Features.Submissions.Commands;
using DTO.MessageBroker.Messages.Search;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Search;

public sealed class IndexSubmissionQuoteMessageConsumer : IConsumer<IndexSubmissionQuoteMessage>
{
    private readonly ISender _mediatr;

    public IndexSubmissionQuoteMessageConsumer(
        ISender mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Consume(ConsumeContext<IndexSubmissionQuoteMessage> context)
    {
        await _mediatr.Send(new SubmissionQuoteIndexCommand(context.Message.SubmissionQuoteId));
    }
}