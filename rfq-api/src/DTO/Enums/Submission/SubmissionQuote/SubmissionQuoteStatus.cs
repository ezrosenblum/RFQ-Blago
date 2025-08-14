using DTO.Attributes;

namespace DTO.Enums.Submission.SubmissionQuote;

public enum SubmissionQuoteStatus
{
    [LocalizationKey("enum.submissionQuoteStatus.pending")]
    Pending = 1,
    [LocalizationKey("enum.submissionQuoteStatus.accepted")]
    Accepted = 2,
    [LocalizationKey("enum.submissionQuoteStatus.rejected")]
    Rejected = 3,
    [LocalizationKey("enum.submissionQuoteStatus.invalid")]
    Invalid = 4
}
