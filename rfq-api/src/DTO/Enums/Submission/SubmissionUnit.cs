using DTO.Attributes;

namespace DTO.Enums.Submission;

public enum SubmissionUnit
{
    [LocalizationKey("enum.submissionUnit.lf")]
    LF = 1,
    [LocalizationKey("enum.submissionUnit.sf")]
    SF,
    [LocalizationKey("enum.submissionUnit.ea")]
    EA
}
