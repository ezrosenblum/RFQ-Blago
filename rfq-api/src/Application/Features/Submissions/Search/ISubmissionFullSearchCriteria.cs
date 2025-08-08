using Application.Common.Search;
using DTO.Submission.Search;

namespace Application.Features.Submissions.Search;

public interface ISubmissionFullSearchCriteria : IFullSearchCriteria<SubmissionFullSearchSortField>
{
    public int? UserId { get; }
    public int? Status { get; }
    public int? Unit { get; }
    public DateTime? DateFrom { get; }
    public DateTime? DateTo { get; }
    public List<int>? Category { get; }
    public List<int>? Subcategory { get; }
}
