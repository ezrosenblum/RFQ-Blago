using Domain.Entities.Submissions;

namespace Domain.Events.Submissions;

public sealed class SubmissionApprovedEvent : BaseEvent
{

    public SubmissionApprovedEvent(Submission submission)
    {
        Submission = submission;
    }

    public Submission Submission { get; }
}