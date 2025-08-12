using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using AutoMapper;
using DTO.Submission.SubmissionQuote.QuoteMessage;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Queries;

public sealed record QuoteMessageGetQuery(int QuoteMessageId) : IQuery<QuoteMessageResponse>;

public sealed class QuoteMessageGetQueryHandler : IQueryHandler<QuoteMessageGetQuery, QuoteMessageResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ILocalizationService _localizationService;

    public QuoteMessageGetQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        ILocalizationService localizationService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _localizationService = localizationService;
    }
    public async Task<QuoteMessageResponse> Handle(QuoteMessageGetQuery query, CancellationToken cancellationToken)
    {
        var quoteMessage = await _dbContext.QuoteMessage
                             .Include(s => s.Sender)
                             .Include(s => s.SubmissionQuote)
                             .AsNoTracking()
                             .FirstOrDefaultAsync(s => s.Id == query.QuoteMessageId, cancellationToken);

        if (quoteMessage == null)
            throw new NotFoundException(_localizationService.GetValue("quoteMessage.notFound.error.message"));

        var response = _mapper.Map<QuoteMessageResponse>(quoteMessage);

        return response;
    }
}