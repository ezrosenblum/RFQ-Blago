using DTO.Enums.Submission;

namespace Domain.Entities.Submissions;

public interface ISubmissionInsertData
{
    string Description { get; }
    int Quantity { get; }
    SubmissionUnit Unit { get; }
    string JobLocation { get; }
    string? StreetAddress { get; }
    double? LatitudeAddress { get; }
    double? LongitudeAddress { get; }

}