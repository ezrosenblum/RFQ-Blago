using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Queries;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageRebuildSearchIndexCommand : ICommand;

public sealed class QuoteMessageRebuildSearchIndexCommandHandler : ICommandHandler<QuoteMessageRebuildSearchIndexCommand>
{
    private readonly ILogger<QuoteMessageRebuildSearchIndexCommandHandler> _logger;
    private readonly ISearchClient<QuoteMessageSearchable> _searchClient;
    private readonly ISearchIndexProvider _searchIndexProvider;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public QuoteMessageRebuildSearchIndexCommandHandler(
        ILogger<QuoteMessageRebuildSearchIndexCommandHandler> logger,
        ISearchClient<QuoteMessageSearchable> searchClient,
        ISearchIndexProvider searchIndexProvider,
        ISender mediatr,
        IMapper mapper)
    {
        _logger = logger;
        _searchClient = searchClient;
        _searchIndexProvider = searchIndexProvider;
        _mediatr = mediatr;
        _mapper = mapper;
    }
    public async Task Handle(QuoteMessageRebuildSearchIndexCommand request, CancellationToken cancellationToken)
    {
        var index = _searchIndexProvider.GetIndex<QuoteMessageSearchable>();
        try
        {
            await _searchClient.CreateIndexIfNotExist(index);
            _logger.LogInformation("Attempting to delete data for index: {0}", index);
            await _searchClient.DeleteAllAsync(cancellationToken);
            _logger.LogInformation("Delete finished for index: {0}", index);
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while deleting Elastic index {0}", index);
        }

        try
        {
            _logger.LogInformation("Attempting to index data for index: {0}", index);

            var quoteMessages = await _mediatr.Send(new QuoteMessageGetAllQuery());

            _logger.LogInformation("Attempting to index data for index: {0} with quote message count {1}", index, quoteMessages.Count);
            if (quoteMessages.Any())
            {
                var searchableQuoteMessages = _mapper.Map<IReadOnlyCollection<QuoteMessageSearchable>>(quoteMessages);
                await _searchClient.IndexAndRefreshManyAsync(searchableQuoteMessages, cancellationToken);
                _logger.LogInformation("Indexing data finished for index: {0}", index);
            }
            else
            {
                _logger.LogInformation("No quote messages to index...");
            }
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while reindexing Elastic index {0}", index);
        }
    }
}