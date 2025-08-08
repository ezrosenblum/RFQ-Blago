using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Common.Services;
using Application.Features.Submissions.Search;
using DTO.Enums.Submission;
using DTO.Pagination;
using DTO.Response;
using DTO.Sorting;
using DTO.Submission.Search;
using DTO.Submission.SubmissionStatusHistory;
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
        var response = new PaginatedList<SubmissionSearchable>(new List<SubmissionSearchable>(), 0, query.Paging.PageNumber, query.Paging.PageSize);

        if (_currentUserService.UserRole == UserRole.Customer)
            response = await _searchClient.SearchSubmissionsAsync(query with { UserId = _currentUserService.UserId });

        if (_currentUserService.UserRole == UserRole.Vendor)
        {
            response = await FilterSubmissionsByVendorGeoLocation(query, cancellationToken);

            response = SetVendorStatuses(response);
        }

        response = RemoveHistoryItems(response);

        return response;
    }
    private async Task<PaginatedList<SubmissionSearchable>> FilterSubmissionsByVendorGeoLocation(SubmissionFullSearchQuery query, CancellationToken cancellationToken)
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

        return await _searchClient.SearchSubmissionsAsync(query);
    }
    private PaginatedList<SubmissionSearchable> SetVendorStatuses(PaginatedList<SubmissionSearchable> response)
    {
        foreach (var item in response.Items)
        {
            var vendorStatus = item.StatusHistory
                .OrderByDescending(s => s.DateCreated)
                .FirstOrDefault(s => s.VendorId == _currentUserService.UserId);

            item.VendorStatus = vendorStatus?.Status ?? new ListItemBaseResponse()
            {
                Id = (int)SubmissionStatusHistoryType.New,
                Name = SubmissionStatusHistoryType.New.ToString()
            };
        }

        return response;
    }
    private PaginatedList<SubmissionSearchable> RemoveHistoryItems(PaginatedList<SubmissionSearchable> response)
    {
        foreach (var item in response.Items)
        {
            item.StatusHistory = new List<SubmissionStatusHistoryResponse>();

            if (_currentUserService.UserRole == UserRole.Vendor)
                item.StatusHistoryCount = new List<SubmissionStatusHistoryCountResponse>();
        }

        return response;
    }
}