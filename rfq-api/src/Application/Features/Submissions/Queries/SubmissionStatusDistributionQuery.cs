using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using DTO.Enums.Submission;
using DTO.Submission.Report;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionStatusDistributionQuery() : IQuery<StatusDistributionResponse>;

public sealed class SubmissionStatusDistributionQueryHandler : IQueryHandler<SubmissionStatusDistributionQuery, StatusDistributionResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public SubmissionStatusDistributionQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<StatusDistributionResponse> Handle(SubmissionStatusDistributionQuery request, CancellationToken cancellationToken)
    {
        var submissions = await _dbContext.Submission
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalCount = submissions.Count;
        
        if (totalCount == 0)
        {
            return new StatusDistributionResponse
            {
                StatusDistribution = new List<StatusDistributionData>()
            };
        }

        var statusDistribution = submissions
            .GroupBy(s => s.Status)
            .Select(g => new StatusDistributionData
            {
                StatusName = g.Key.ToString(),
                Count = g.Count(),
                Percentage = Math.Round((decimal)g.Count() / totalCount * 100, 1)
            })
            .OrderByDescending(s => s.Count)
            .ToList();

        return new StatusDistributionResponse
        {
            StatusDistribution = statusDistribution
        };
    }
}