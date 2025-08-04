using DTO.Attributes;

namespace DTO.Enums.Submission;

public enum SubmissionStatus
{
    [LocalizationKey("enum.submissionStatus.pendingReview")]
    PendingReview = 1,
    [LocalizationKey("enum.submissionStatus.underReview")]
    UnderReview,
    [LocalizationKey("enum.submissionStatus.accepted")]
    Accepted,
    [LocalizationKey("enum.submissionStatus.rejected")]
    Rejected
}
