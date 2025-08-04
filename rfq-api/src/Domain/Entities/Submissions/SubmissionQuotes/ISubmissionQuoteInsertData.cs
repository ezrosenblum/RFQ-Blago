using DTO.Enums.Submission.SubmissionQuote;

namespace Domain.Entities.Submissions.SubmissionQuotes;

public interface ISubmissionQuoteInsertData : ISubmissionQuoteUpdateData
{
    int SubmissionId { get; }
    int VendorId { get; }
}
