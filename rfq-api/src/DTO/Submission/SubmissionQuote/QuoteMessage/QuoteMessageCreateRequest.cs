using Microsoft.AspNetCore.Http;

namespace DTO.Submission.SubmissionQuote.QuoteMessage;

public sealed record QuoteMessageCreateRequest
{
    public int SubmissionQuoteId { get; init; }
    public string? Content { get; init; }
    public List<IFormFile> Files { get; init; } = new List<IFormFile>();
}
