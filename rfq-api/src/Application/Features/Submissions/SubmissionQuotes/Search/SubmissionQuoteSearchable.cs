using Application.Common.Search;
using DTO.Submission.SubmissionQuote;

namespace Application.Features.Submissions.SubmissionQuotes.Search;

public sealed record SubmissionQuoteSearchable : SubmissionQuoteResponse, ISearchable
{
}
