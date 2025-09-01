using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Domain.Interfaces;
using DTO.Enums.Submission;
using DTO.Submission.Report;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionTimelineQuery(int DaysBack = 30) : IQuery<SubmissionTimelineResponse>;

public sealed class SubmissionTimelineQueryHandler : IQueryHandler<SubmissionTimelineQuery, SubmissionTimelineResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IDateTime _dateTime;

    public SubmissionTimelineQueryHandler(
        IApplicationDbContext dbContext,
        IDateTime dateTime)
    {
        _dbContext = dbContext;
        _dateTime = dateTime;
    }

    public async Task<SubmissionTimelineResponse> Handle(SubmissionTimelineQuery request, CancellationToken cancellationToken)
    {
        var startDate = _dateTime.Now.AddDays(-request.DaysBack).Date;
        var endDate = _dateTime.Now.Date;

        var submissions = await _dbContext.Submission
            .Where(s => s.Created.Date >= startDate && s.Created.Date <= endDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var timeline = new List<SubmissionTimelineData>();

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var dailySubmissions = submissions.Where(s => s.Created.Date == date).ToList();
            var submissionsCount = dailySubmissions.Count;
            var completedCount = dailySubmissions.Count(s => s.Status == SubmissionStatus.Approved || s.Status == SubmissionStatus.Completed);
            var completionRate = submissionsCount > 0 ? Math.Round((decimal)completedCount / submissionsCount * 100, 1) : 0;

            timeline.Add(new SubmissionTimelineData
            {
                Date = date,
                SubmissionsCount = submissionsCount,
                CompletedCount = completedCount,
                CompletionRate = completionRate
            });
        }

        return new SubmissionTimelineResponse
        {
            Timeline = timeline
        };
    }
}