using Domain.Entities.Submissions;
using Microsoft.AspNetCore.Http;

namespace Domain.Events.Submissions;

public sealed class SubmissionCreatedEvent : BaseEvent
{

    public SubmissionCreatedEvent(
        Submission submission,
        List<IFormFile>? files)
    {
        Submission = submission;
        Files = files;
    }

    public Submission Submission { get; }
    public List<IFormFile>? Files { get; }
}