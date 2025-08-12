using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;
using DTO.Pagination;
using DTO.Sorting;
using DTO.Submission.SubmissionQuote.QuoteMessage.Search;
using DTO.User;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Queries;

public sealed record QuoteMessageFullSearchQuery(
    string? Query,
    int? SubmissionQuoteId,
    PaginationOptions Paging,
    SortOptions<QuoteMessageFullSearchSortField>? Sorting) : IQuoteMessageFullSearchCriteria, IQuery<PaginatedList<QuoteMessageSearchable>>;

public sealed class QuoteMessageFullSearchQueryHandler : IQueryHandler<QuoteMessageFullSearchQuery, PaginatedList<QuoteMessageSearchable>>
{
    private readonly ISearchClient<QuoteMessageSearchable> _searchClient;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _applicationDbContext;

    public QuoteMessageFullSearchQueryHandler(
        ISearchClient<QuoteMessageSearchable> searchClient,
        ICurrentUserService currentUserService,
        IApplicationDbContext applicationDbContext)
    {
        _searchClient = searchClient;
        _currentUserService = currentUserService;
        _applicationDbContext = applicationDbContext;
    }

    public async Task<PaginatedList<QuoteMessageSearchable>> Handle(QuoteMessageFullSearchQuery query, CancellationToken cancellationToken)
    {
        if(_currentUserService.UserRole != UserRole.Administrator)
        {
            var hasAccessToSubmissionQuote = await _applicationDbContext.SubmissionQuote
                .Where(s => s.Id == query.SubmissionQuoteId)
                .Include(s => s.Submission)
                .AnyAsync(sq => sq.VendorId == _currentUserService.UserId ||
                                sq.Submission.UserId == _currentUserService.UserId, 
                                cancellationToken);

            if(!hasAccessToSubmissionQuote)
                throw new ForbiddenAccessException("submissionQuote.accessDenied.message");
        }

        return await _searchClient.SearchQuoteMessagesAsync(query);
    }
}