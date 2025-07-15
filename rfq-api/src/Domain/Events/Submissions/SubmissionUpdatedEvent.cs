using Domain.Entities.Submissions;

namespace Domain.Events.Submissions;

public sealed class SubmissionUpdatedEvent : BaseEvent
{

    public SubmissionUpdatedEvent(Submission submission)
    {
        Submission = submission;
    }

    public Submission Submission { get; }
}