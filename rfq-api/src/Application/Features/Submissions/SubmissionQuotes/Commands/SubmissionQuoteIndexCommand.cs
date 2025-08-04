using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.SubmissionQuotes.Queries;
using Application.Features.Submissions.SubmissionQuotes.Search;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionQuoteIndexCommand(int SubmissionQuoteId) : ICommand;

public sealed record SubmissionQuoteIndexCommandHandler : ICommandHandler<SubmissionQuoteIndexCommand>
{
    private readonly ILogger<SubmissionQuoteIndexCommandHandler> _logger;
    private readonly ISearchClient<SubmissionQuoteSearchable> _searchClient;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public SubmissionQuoteIndexCommandHandler(
        ILogger<SubmissionQuoteIndexCommandHandler> logger,
        ISearchClient<SubmissionQuoteSearchable> searchClient,
        ISender mediatr,
        IMapper mapper)
    {
        _logger = logger;
        _searchClient = searchClient;
        _mediatr = mediatr;
        _mapper = mapper;
    }

    public async Task Handle(SubmissionQuoteIndexCommand command, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to index data for submission quote with ID: {0}", command.SubmissionQuoteId);
        var submissionQuote = await _mediatr.Send(new SubmissionQuoteGetQuery(command.SubmissionQuoteId));

        if (submissionQuote != null)
        {
            try
            {
                await _searchClient.IndexAndRefreshAsync(_mapper.Map<SubmissionQuoteSearchable>(submissionQuote), cancellationToken);
                _logger.LogInformation("Indexing finished for submission quote with ID: {0}", command.SubmissionQuoteId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while reindexing data for submission quote with ID: {0}", command.SubmissionQuoteId);
            }
        }
        else
        {
            _logger.LogInformation("Submission quote does not exist: {0}", command.SubmissionQuoteId);
        }
    }
}