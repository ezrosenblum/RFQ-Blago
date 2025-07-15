using Application.Common.Search;
using DTO.Submission;

namespace Application.Features.Submissions.Search;

public sealed record SubmissionSearchable : SubmissionResponse, ISearchable
{
}
