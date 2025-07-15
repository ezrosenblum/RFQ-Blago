using Application.Common.Caching;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Submission;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionGetAllQuery() : IQuery<IReadOnlyCollection<SubmissionResponse>>;
public sealed class SubmissionGetAllQueryHandler : IQueryHandler<SubmissionGetAllQuery, IReadOnlyCollection<SubmissionResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;

    public SubmissionGetAllQueryHandler(
        IApplicationDbContext dbContext, 
        IMapper mapper,
        ICacheService cacheService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _cacheService = cacheService;
    }
    public async Task<IReadOnlyCollection<SubmissionResponse>> Handle(SubmissionGetAllQuery request, CancellationToken cancellationToken)
    {
        var cachedSubmissions = await _cacheService.GetAsync<IReadOnlyCollection<SubmissionResponse>>(CacheKeys.AllSubmissions, cancellationToken);

        if (cachedSubmissions is not null)
            return cachedSubmissions;

        var submissions = await _dbContext.Submission
            .AsNoTracking()
            .Include(s => s.User)
            .ToListAsync(cancellationToken);

        var response = _mapper.Map<IReadOnlyCollection<SubmissionResponse>>(submissions);

        await _cacheService.AddAsync(CacheKeys.AllSubmissions, response, cancellationToken);

        return response;
    }
}