using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.MessageBroker;
using DTO.MessageBroker.Messages.Search;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteInitiateSearchIndexRebuildCommand() : ICommand;

public sealed class SubmissionQuoteInitiateSearchIndexRebuildCommandHandler : ICommandHandler<SubmissionQuoteInitiateSearchIndexRebuildCommand>
{
    private readonly IMessagePublisher _messagePublisher;
    public SubmissionQuoteInitiateSearchIndexRebuildCommandHandler(IMessagePublisher messagePublisher)
    {
        _messagePublisher = messagePublisher;
    }
    public async Task Handle(SubmissionQuoteInitiateSearchIndexRebuildCommand command, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(new RebuildSubmissionQuoteIndexMessage());
    }
}