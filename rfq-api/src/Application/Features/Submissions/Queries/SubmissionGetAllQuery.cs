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
 
    public SubmissionGetAllQueryHandler(
        IApplicationDbContext dbContext, 
        IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }
    public async Task<IReadOnlyCollection<SubmissionResponse>> Handle(SubmissionGetAllQuery request, CancellationToken cancellationToken)
    {
        var submissions = await _dbContext.Submission
            .AsNoTracking()
            .Include(s => s.SubmissionQuotes)
            .Include(s => s.User)
            .Include(s => s.Categories)
            .Include(s => s.Subcategories)
            .ToListAsync(cancellationToken);

        var response = _mapper.Map<IReadOnlyCollection<SubmissionResponse>>(submissions);

        return response;
    }
}