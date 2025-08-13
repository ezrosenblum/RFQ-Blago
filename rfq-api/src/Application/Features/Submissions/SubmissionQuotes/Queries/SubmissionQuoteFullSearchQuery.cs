using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.SubmissionQuotes.Search;
using DTO.Pagination;
using DTO.Sorting;
using DTO.Submission.SubmissionQuote.Search;
using DTO.User;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Submissions.SubmissionQuotes.Queries;

public sealed record SubmissionQuoteFullSearchQuery(
    string? Query,
    int? VendorId,
    int? SubmissionId,
    int? SubmissionUserId,
    decimal? PriceFrom,
    decimal? PriceTo,
    DateTime? ValidFrom,
    DateTime? ValidTo,
    PaginationOptions Paging,
    SortOptions<SubmissionQuoteFullSearchSortField>? Sorting,
    bool HasConversations = false) : ISubmissionQuoteFullSearchCriteria, IQuery<PaginatedList<SubmissionQuoteSearchable>>;

public sealed class SubmissionQuoteFullSearchQueryHandler : IQueryHandler<SubmissionQuoteFullSearchQuery, PaginatedList<SubmissionQuoteSearchable>>
{
    private readonly ISearchClient<SubmissionQuoteSearchable> _searchClient;
    private readonly ICurrentUserService _currentUserService;
    public SubmissionQuoteFullSearchQueryHandler(
        ISearchClient<SubmissionQuoteSearchable> searchClient,
        ICurrentUserService currentUserService)
    {
        _searchClient = searchClient;
        _currentUserService = currentUserService;
    }

    public async Task<PaginatedList<SubmissionQuoteSearchable>> Handle(SubmissionQuoteFullSearchQuery query, CancellationToken cancellationToken)
    {
        var validFrom = query.ValidFrom;

        if (validFrom == null)
            validFrom = DateTime.UtcNow;

        if (_currentUserService.UserRole == UserRole.Vendor)
        {
            return await _searchClient.SearchSubmissionQuotesAsync(query with { VendorId = _currentUserService.UserId, ValidFrom = validFrom });
        }

        if(_currentUserService.UserRole == UserRole.Customer)
        {
            return await _searchClient.SearchSubmissionQuotesAsync(query with { SubmissionUserId = _currentUserService.UserId, ValidFrom = validFrom });
        }

        return await _searchClient.SearchSubmissionQuotesAsync(query);
    }
}