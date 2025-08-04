using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using AutoMapper;
using DTO.Submission.SubmissionQuote;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.Queries;

public sealed record SubmissionQuoteGetQuery(int SubmissionQuoteId) : IQuery<SubmissionQuoteResponse>;

public sealed class SubmissionQuoteGetQueryHandler : IQueryHandler<SubmissionQuoteGetQuery, SubmissionQuoteResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ILocalizationService _localizationService;

    public SubmissionQuoteGetQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        ILocalizationService localizationService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _localizationService = localizationService;
    }
    public async Task<SubmissionQuoteResponse> Handle(SubmissionQuoteGetQuery query, CancellationToken cancellationToken)
    {
        var submissionQuote = await _dbContext.SubmissionQuote
                             .Include(s => s.Vendor)
                                .ThenInclude(s => s.CompanyDetails)
                             .Include(s => s.Submission)
                                .ThenInclude(s => s.User)
                             .AsNoTracking()
                             .FirstOrDefaultAsync(s => s.Id == query.SubmissionQuoteId, cancellationToken);

        if (submissionQuote == null)
            throw new NotFoundException(_localizationService.GetValue("submissionQuote.notFound.error.message"));

        var response = _mapper.Map<SubmissionQuoteResponse>(submissionQuote);

        return response;
    }
}
