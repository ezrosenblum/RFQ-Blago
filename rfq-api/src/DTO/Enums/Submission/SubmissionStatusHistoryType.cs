using DTO.Attributes;

namespace DTO.Enums.Submission;

public enum SubmissionStatusHistoryType
{
    [LocalizationKey("enum.submissionStatusHistoryType.new")]
    New = 1,
    [LocalizationKey("enum.submissionStatusHistoryType.viewed")]
    Viewed,
    [LocalizationKey("enum.submissionStatusHistoryType.quoted")]
    Quoted,
    [LocalizationKey("enum.submissionStatusHistoryType.engaged")]
    Engaged,
}
