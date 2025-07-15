using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Submissions.Search;
using DTO.Pagination;
using DTO.Sorting;
using DTO.Submission.Search;

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
    public SubmissionFullSearchQueryHandler(ISearchClient<SubmissionSearchable> searchClient)
    {
        _searchClient = searchClient;
    }
    
    public async Task<PaginatedList<SubmissionSearchable>> Handle(SubmissionFullSearchQuery query, CancellationToken cancellationToken)
    {
        return await _searchClient.SearchSubmissionsAsync(query);
    }
}