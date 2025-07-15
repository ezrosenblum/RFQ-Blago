using System.Xml.Schema;

namespace DTO.Submission.Report;

public sealed record SubmissionReportResponse
{
    public int SubmissionsCount { get; init; }
    public int PendingSubmissionsCount { get; init; }
    public int ReviewedSubmissionsCount { get; init; }
    public int AcceptedSubmissionsCount { get; init; }
    public int RejectedSubmissionsCount { get; init; }
    public int Last24HoursSubmissionsCount { get; init; }
    
}
