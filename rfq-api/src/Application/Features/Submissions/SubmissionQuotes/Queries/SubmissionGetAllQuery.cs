using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Submission.SubmissionQuote;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.Queries;

public sealed record SubmissionQuoteGetAllQuery() : IQuery<IReadOnlyCollection<SubmissionQuoteResponse>>;
public sealed class SubmissionQuoteGetAllQueryHandler : IQueryHandler<SubmissionQuoteGetAllQuery, IReadOnlyCollection<SubmissionQuoteResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
 
    public SubmissionQuoteGetAllQueryHandler(
        IApplicationDbContext dbContext, 
        IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }
    public async Task<IReadOnlyCollection<SubmissionQuoteResponse>> Handle(SubmissionQuoteGetAllQuery request, CancellationToken cancellationToken)
    {
        var submissionQuotes = await _dbContext.SubmissionQuote
            .AsNoTracking()
            .Include(s => s.Vendor)
                .ThenInclude(s => s.CompanyDetails)
            .Include(s => s.Submission)
                .ThenInclude(s => s.User)
            .ToListAsync(cancellationToken);

        var response = _mapper.Map<IReadOnlyCollection<SubmissionQuoteResponse>>(submissionQuotes);

        return response;
    }
}