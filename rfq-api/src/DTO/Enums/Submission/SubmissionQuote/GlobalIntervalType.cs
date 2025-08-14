using DTO.Attributes;

namespace DTO.Enums.Submission.SubmissionQuote;

public enum GlobalIntervalType
{
    [LocalizationKey("enum.globalIntervalType.day")]
    Day = 1,
    [LocalizationKey("enum.globalIntervalType.week")]
    Week = 2,
    [LocalizationKey("enum.globalIntervalType.month")]
    Month = 3,
    [LocalizationKey("enum.globalIntervalType.year")]
    Year = 4
}