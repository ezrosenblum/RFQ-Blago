using DTO.Enums.Submission.SubmissionQuote;

namespace DTO.Submission.SubmissionQuote;

public sealed record SubmissionQuoteUpdateRequest
{
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public decimal Price { get; init; }
    public GlobalIntervalType QuoteValidityIntervalType { get; init; }
    public int QuoteValidityInterval { get; init; }
    public GlobalIntervalType? TimelineIntervalType { get; init; }
    public int? MinimumTimelineDuration { get; init; }
    public int? MaximumTimelineDuration { get; init; }
    public GlobalIntervalType? WarantyIntervalType { get; init; }
    public int? WarantyDuration { get; init; }
}
