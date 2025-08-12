using Application.Common.Search;
using DTO.Submission.SubmissionQuote.QuoteMessage;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;

public sealed record QuoteMessageSearchable : QuoteMessageResponse, ISearchable
{
}
