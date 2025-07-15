using Application.Features.Submissions.Commands;
using DTO.MessageBroker.Messages.Search;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Search;

public sealed class RebuildSubmissionIndexMessageConsumer : IConsumer<RebuildSubmissionIndexMessage>
{
    private readonly ISender _mediatr;

    public RebuildSubmissionIndexMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<RebuildSubmissionIndexMessage> context)
    {
        await _mediatr.Send(new SubmissionRebuildSearchIndexCommand());
    }
}