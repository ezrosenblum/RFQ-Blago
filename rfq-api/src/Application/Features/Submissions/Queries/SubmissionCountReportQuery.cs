using Application.Common.Caching;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Submission.Report;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionCountReportQuery() : IQuery<SubmissionReportResponse>;

public sealed class SubmissionCountReportQueryHandler : IQueryHandler<SubmissionCountReportQuery, SubmissionReportResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;

    public SubmissionCountReportQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        ICacheService cacheService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _cacheService = cacheService;
    }
    public async Task<SubmissionReportResponse> Handle(SubmissionCountReportQuery request, CancellationToken cancellationToken)
    {
        var cachedReport = await _cacheService.GetAsync<SubmissionReportResponse>(CacheKeys.SubmissionsReport, cancellationToken);

        if (cachedReport is not null)
            return cachedReport;

        var submissions = await _dbContext.Submission
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var response = _mapper.Map<SubmissionReportResponse>(submissions);

        await _cacheService.AddAsync(CacheKeys.SubmissionsReport, response, cancellationToken);

        return response;
    }

}