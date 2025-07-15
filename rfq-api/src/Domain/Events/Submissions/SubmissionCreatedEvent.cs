using Domain.Entities.Submissions;

namespace Domain.Events.Submissions;

public sealed class SubmissionCreatedEvent : BaseEvent
{

    public SubmissionCreatedEvent(Submission submission)
    {
        Submission = submission;
    }

    public Submission Submission { get; }
}