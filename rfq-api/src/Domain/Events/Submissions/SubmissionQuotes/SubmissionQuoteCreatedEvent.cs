using Domain.Entities.Submissions.SubmissionQuotes;
using Microsoft.AspNetCore.Http;

namespace Domain.Events.Submissions.SubmissionQuotes;

public sealed class SubmissionQuoteCreatedEvent : BaseEvent
{
    public SubmissionQuoteCreatedEvent(SubmissionQuote submissionQuote, IReadOnlyCollection<IFormFile> files)
    {
        SubmissionQuote = submissionQuote;
        Media = files;
    }

    public SubmissionQuote SubmissionQuote { get;  } = null!;
    public IReadOnlyCollection<IFormFile>? Media { get; }
}
