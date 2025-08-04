using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.Queries;
using Application.Features.Submissions.SubmissionQuotes.Search;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteRebuildSearchIndexCommand : ICommand;

public sealed class SubmissionQuoteRebuildSearchIndexCommandHandler : ICommandHandler<SubmissionQuoteRebuildSearchIndexCommand>
{
    private readonly ILogger<SubmissionQuoteRebuildSearchIndexCommandHandler> _logger;
    private readonly ISearchClient<SubmissionQuoteSearchable> _searchClient;
    private readonly ISearchIndexProvider _searchIndexProvider;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public SubmissionQuoteRebuildSearchIndexCommandHandler(
        ILogger<SubmissionQuoteRebuildSearchIndexCommandHandler> logger,
        ISearchClient<SubmissionQuoteSearchable> searchClient,
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
    public async Task Handle(SubmissionQuoteRebuildSearchIndexCommand request, CancellationToken cancellationToken)
    {
        var index = _searchIndexProvider.GetIndex<SubmissionQuoteSearchable>();
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

            var submissionQuotes = await _mediatr.Send(new SubmissionQuoteGetAllQuery());

            _logger.LogInformation("Attempting to index data for index: {0} with submission quote count {1}", index, submissionQuotes.Count);
            if (submissionQuotes.Any())
            {
                var searchableSubmissionQuotes = _mapper.Map<IReadOnlyCollection<SubmissionQuoteSearchable>>(submissionQuotes);
                await _searchClient.IndexAndRefreshManyAsync(searchableSubmissionQuotes, cancellationToken);
                _logger.LogInformation("Indexing data finished for index: {0}", index);
            }
            else
            {
                _logger.LogInformation("No submission quotes to index...");
            }
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while reindexing Elastic index {0}", index);
        }
    }
}