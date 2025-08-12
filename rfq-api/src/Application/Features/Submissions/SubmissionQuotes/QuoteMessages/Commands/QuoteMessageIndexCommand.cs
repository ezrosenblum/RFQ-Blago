using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Queries;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageIndexCommand(int QuoteMessageId) : ICommand;

public sealed record QuoteMessageIndexCommandHandler : ICommandHandler<QuoteMessageIndexCommand>
{
    private readonly ILogger<QuoteMessageIndexCommandHandler> _logger;
    private readonly ISearchClient<QuoteMessageSearchable> _searchClient;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public QuoteMessageIndexCommandHandler(
        ILogger<QuoteMessageIndexCommandHandler> logger,
        ISearchClient<QuoteMessageSearchable> searchClient,
        ISender mediatr,
        IMapper mapper)
    {
        _logger = logger;
        _searchClient = searchClient;
        _mediatr = mediatr;
        _mapper = mapper;
    }

    public async Task Handle(QuoteMessageIndexCommand command, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting to index data for quote message with ID: {0}", command.QuoteMessageId);
        var quoteMessage = await _mediatr.Send(new QuoteMessageGetQuery(command.QuoteMessageId));

        if (quoteMessage != null)
        {
            try
            {
                await _searchClient.IndexAndRefreshAsync(_mapper.Map<QuoteMessageSearchable>(quoteMessage), cancellationToken);
                _logger.LogInformation("Indexing finished for quote message with ID: {0}", command.QuoteMessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while reindexing data for quote message with ID: {0}", command.QuoteMessageId);
            }
        }
        else
        {
            _logger.LogInformation("Quote message does not exist: {0}", command.QuoteMessageId);
        }
    }
}
