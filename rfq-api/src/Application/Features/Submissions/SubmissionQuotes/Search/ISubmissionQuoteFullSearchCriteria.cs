using Application.Common.Search;
using DTO.Submission.SubmissionQuote.Search;

namespace Application.Features.Submissions.SubmissionQuotes.Search;

public interface ISubmissionQuoteFullSearchCriteria : IFullSearchCriteria<SubmissionQuoteFullSearchSortField>
{
    public int? VendorId { get; }
    public int? SubmissionId { get; }
    public int? SubmissionUserId { get; }
    public decimal? PriceFrom { get; }
    public decimal? PriceTo { get; }
    public DateTime? ValidFrom { get; }
    public DateTime? ValidTo { get; }
    public bool HasConversations { get; }
}
