using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Submission.SubmissionQuote.QuoteMessage;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Queries;

public sealed record QuoteMessageGetAllQuery() : IQuery<IReadOnlyCollection<QuoteMessageResponse>>;
public sealed class QuoteMessageGetAllQueryHandler : IQueryHandler<QuoteMessageGetAllQuery, IReadOnlyCollection<QuoteMessageResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public QuoteMessageGetAllQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }
    public async Task<IReadOnlyCollection<QuoteMessageResponse>> Handle(QuoteMessageGetAllQuery request, CancellationToken cancellationToken)
    {
        var submissions = await _dbContext.QuoteMessage
            .AsNoTracking()
            .Include(s => s.Sender)
            .Include(s => s.SubmissionQuote)
            .ToListAsync(cancellationToken);

        var response = _mapper.Map<IReadOnlyCollection<QuoteMessageResponse>>(submissions);

        return response;
    }
}