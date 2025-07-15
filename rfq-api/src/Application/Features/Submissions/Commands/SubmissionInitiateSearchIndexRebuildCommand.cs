using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.MessageBroker;
using DTO.MessageBroker.Messages.Search;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionInitiateSearchIndexRebuildCommand() : ICommand;

public sealed class SubmissionInitiateSearchIndexRebuildCommandHandler : ICommandHandler<SubmissionInitiateSearchIndexRebuildCommand>
{
    private readonly IMessagePublisher _messagePublisher;
    public SubmissionInitiateSearchIndexRebuildCommandHandler(IMessagePublisher messagePublisher)
    {
        _messagePublisher = messagePublisher;
    }
    public async Task Handle(SubmissionInitiateSearchIndexRebuildCommand command, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(new RebuildSubmissionIndexMessage());
    }
}