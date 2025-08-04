using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.Search;
using DTO.Pagination;
using DTO.Sorting;
using DTO.Submission.Search;
using DTO.User;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionFullSearchQuery(
    string? Query,
    int? UserId,
    int? Status,
    int? Unit,
    DateTime? DateFrom,
    DateTime? DateTo,
    PaginationOptions Paging,
    SortOptions<SubmissionFullSearchSortField>? Sorting) : ISubmissionFullSearchCriteria, IQuery<PaginatedList<SubmissionSearchable>>;

public sealed class SubmissionFullSearchQueryHandler : IQueryHandler<SubmissionFullSearchQuery, PaginatedList<SubmissionSearchable>>
{
    private readonly ISearchClient<SubmissionSearchable> _searchClient;
    private readonly ICurrentUserService _currentUserService;

    public SubmissionFullSearchQueryHandler(
        ISearchClient<SubmissionSearchable> searchClient,
        ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _searchClient = searchClient;
    }
    
    public async Task<PaginatedList<SubmissionSearchable>> Handle(SubmissionFullSearchQuery query, CancellationToken cancellationToken)
    {
        if(_currentUserService.UserRole == UserRole.Customer)
        {
            return await _searchClient.SearchSubmissionsAsync(query with { UserId = _currentUserService.UserId });
        }

        return await _searchClient.SearchSubmissionsAsync(query);
    }
}