using DTO.Attributes;

namespace DTO.Enums.Submission;

public enum SubmissionStatus
{
    [LocalizationKey("enum.submissionStatus.pendingReview")]
    PendingReview = 1,
    [LocalizationKey("enum.submissionStatus.approved")]
    Approved,
    [LocalizationKey("enum.submissionStatus.rejected")]
    Rejected,
    [LocalizationKey("enum.submissionStatus.archived")]
    Archived,
    [LocalizationKey("enum.submissionStatus.completed")]
    Completed
}
