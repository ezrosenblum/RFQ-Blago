using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.MessageBroker;
using DTO.MessageBroker.Messages.Search;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageInitiateSearchIndexRebuildCommand() : ICommand;

public sealed class QuoteMessageInitiateSearchIndexRebuildCommandHandler : ICommandHandler<QuoteMessageInitiateSearchIndexRebuildCommand>
{
    private readonly IMessagePublisher _messagePublisher;
    public QuoteMessageInitiateSearchIndexRebuildCommandHandler(IMessagePublisher messagePublisher)
    {
        _messagePublisher = messagePublisher;
    }
    public async Task Handle(QuoteMessageInitiateSearchIndexRebuildCommand command, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(new RebuildQuoteMessageIndexMessage());
    }
}
