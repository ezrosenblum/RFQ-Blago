using Application.Common.Search;
using DTO.Submission.SubmissionQuote.QuoteMessage.Search;
using DTO.Submission.SubmissionQuote.Search;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;

public interface IQuoteMessageFullSearchCriteria : IFullSearchCriteria<QuoteMessageFullSearchSortField>
{
    public int? SubmissionQuoteId { get; }
}