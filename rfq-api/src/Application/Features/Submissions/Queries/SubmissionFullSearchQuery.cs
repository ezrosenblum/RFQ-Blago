using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Common.Services;
using Application.Features.Submissions.Search;
using DTO.Pagination;
using DTO.Sorting;
using DTO.Submission.Search;
using DTO.User;
using Microsoft.EntityFrameworkCore;

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
    private readonly IGeoCoverageService _geoCoverageService;
    private readonly IApplicationDbContext _dbContext;

    public SubmissionFullSearchQueryHandler(
        ISearchClient<SubmissionSearchable> searchClient,
        ICurrentUserService currentUserService,
        IGeoCoverageService geoCoverageService,
        IApplicationDbContext dbContext)
    {
        _currentUserService = currentUserService;
        _searchClient = searchClient;
        _geoCoverageService = geoCoverageService;
        _dbContext = dbContext;
    }

    public async Task<PaginatedList<SubmissionSearchable>> Handle(SubmissionFullSearchQuery query, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserRole == UserRole.Customer)
        {
            return await _searchClient.SearchSubmissionsAsync(query with { UserId = _currentUserService.UserId });
        }
        if (_currentUserService.UserRole == UserRole.Vendor)
        {
            var company = await _dbContext.UserCompanyDetails
                .FirstOrDefaultAsync(d => d.UserId == _currentUserService.UserId, cancellationToken);

            if (company != null && 
                company.LatitudeAddress.HasValue &&
                company.LongitudeAddress.HasValue &&
                company.OperatingRadius.HasValue)
            {
                var result = await _searchClient.SearchSubmissionsAsync(query with { Paging = new PaginationOptions(1, 10000) });

                var filteredItems = result.Items.Where(s => 
                    _geoCoverageService.IsPointWithinCoverage(
                        company.LatitudeAddress.Value,
                        company.LongitudeAddress.Value,
                        company.OperatingRadius.Value,
                        s.LatitudeAddress ?? 0,
                        s.LongitudeAddress ?? 0))
                    .Skip((query.Paging.PageNumber - 1) * query.Paging.PageSize)
                    .Take(query.Paging.PageSize)
                    .ToList();

                return new PaginatedList<SubmissionSearchable>(filteredItems, filteredItems.Count, query.Paging.PageNumber, query.Paging.PageSize);
            }
        }

        return await _searchClient.SearchSubmissionsAsync(query);
    }
}