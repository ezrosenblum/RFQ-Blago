using Application.Common.Caching;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using AutoMapper;
using DTO.Submission;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionGetQuery(int SubmissionId) : IQuery<SubmissionResponse>;

public sealed class SubmissionGetQueryHandler : IQueryHandler<SubmissionGetQuery, SubmissionResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;
    private readonly ILocalizationService _localizationService;

    public SubmissionGetQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        ICacheService cacheService,
        ILocalizationService localizationService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _cacheService = cacheService;
        _localizationService = localizationService;
    }
    public async Task<SubmissionResponse> Handle(SubmissionGetQuery query, CancellationToken cancellationToken)
    {
        var cacheKey = $"{CacheKeys.Submission}-{query.SubmissionId}";

        var cachedSubmission = await _cacheService.GetAsync<SubmissionResponse>(cacheKey, cancellationToken);

        if (cachedSubmission == null)
        {
            var submission = await _dbContext.Submission.Include(s => s.User)
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(s => s.Id == query.SubmissionId, cancellationToken);

            if (submission == null)
                throw new NotFoundException(_localizationService.GetValue("submission.notFound.error.message"));

            var response = _mapper.Map<SubmissionResponse>(submission);

            await _cacheService.AddAsync(cacheKey, response, cancellationToken);

            return response;
        }

        return cachedSubmission;
    }
}
