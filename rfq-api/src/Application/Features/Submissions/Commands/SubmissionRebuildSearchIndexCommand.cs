using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.Queries;
using Application.Features.Submissions.Search;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionRebuildSearchIndexCommand : ICommand;

public sealed class SubmissionRebuildSearchIndexCommandHandler : ICommandHandler<SubmissionRebuildSearchIndexCommand>
{
    private readonly ILogger<SubmissionRebuildSearchIndexCommandHandler> _logger;
    private readonly ISearchClient<SubmissionSearchable> _searchClient;
    private readonly ISearchIndexProvider _searchIndexProvider;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public SubmissionRebuildSearchIndexCommandHandler(
        ILogger<SubmissionRebuildSearchIndexCommandHandler> logger,
        ISearchClient<SubmissionSearchable> searchClient,
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
    public async Task Handle(SubmissionRebuildSearchIndexCommand request, CancellationToken cancellationToken)
    {
        var index = _searchIndexProvider.GetIndex<SubmissionSearchable>();
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

            var submissions = await _mediatr.Send(new SubmissionGetAllQuery());

            _logger.LogInformation("Attempting to index data for index: {0} with submission count {1}", index, submissions.Count);
            if (submissions.Any())
            {
                var searchableSubmissions = _mapper.Map<IReadOnlyCollection<SubmissionSearchable>>(submissions);
                await _searchClient.IndexAndRefreshManyAsync(searchableSubmissions, cancellationToken);
                _logger.LogInformation("Indexing data finished for index: {0}", index);
            }
            else
            {
                _logger.LogInformation("No submissions to index...");
            }
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while reindexing Elastic index {0}", index);
        }
    }
}