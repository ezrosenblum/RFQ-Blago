using Application.Features.Submissions.Commands;
using DTO.MessageBroker.Messages.Search;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Search;

public sealed class IndexSubmissionMessageConsumer : IConsumer<IndexSubmissionMessage>
{
    private readonly ISender _mediatr;

    public IndexSubmissionMessageConsumer(
        ISender mediatr)
    {
        _mediatr = mediatr;
    }

    public async Task Consume(ConsumeContext<IndexSubmissionMessage> context)
    {
        await _mediatr.Send(new SubmissionIndexCommand(context.Message.SubmissionId));
    }
}