using DTO.Attributes;

namespace DTO.Enums.Submission.SubmissionQuote;

public enum SubmissionQuoteValidityIntervalType
{
    [LocalizationKey("enum.submissionQuoteValidityIntervalType.day")]
    Day = 1,
    [LocalizationKey("enum.submissionQuoteValidityIntervalType.week")]
    Week = 2,
    [LocalizationKey("enum.submissionQuoteValidityIntervalType.month")]
    Month = 3,
    [LocalizationKey("enum.submissionQuoteValidityIntervalType.year")]
    Year = 4
}