using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.Queries;
using Application.Features.Submissions.Search;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionIndexCommand(int SubmissionId) : ICommand;

public sealed record SubmissionIndexCommandHandler : ICommandHandler<SubmissionIndexCommand>
{
    private readonly ILogger<SubmissionIndexCommandHandler> _logger;
    private readonly ISearchClient<SubmissionSearchable> _searchClient;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public SubmissionIndexCommandHandler(
        ILogger<SubmissionIndexCommandHandler> logger,
        ISearchClient<SubmissionSearchable> searchClient,
        ISender mediatr,
        IMapper mapper)
    {
        _logger = logger;
        _searchClient = searchClient;
        _mediatr = mediatr;
        _mapper = mapper;
    }

    public async Task Handle(SubmissionIndexCommand command, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to index data for submission with ID: {0}", command.SubmissionId);
        var submission = await _mediatr.Send(new SubmissionGetQuery(command.SubmissionId));

        if (submission != null)
        {
            try
            {
                await _searchClient.IndexAndRefreshAsync(_mapper.Map<SubmissionSearchable>(submission), cancellationToken);
                _logger.LogInformation("Indexing finished for submission with ID: {0}", command.SubmissionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while reindexing data for submission with ID: {0}", command.SubmissionId);
            }
        }
        else
        {
            _logger.LogInformation("Submission does not exist: {0}", command.SubmissionId);
        }
    }
}