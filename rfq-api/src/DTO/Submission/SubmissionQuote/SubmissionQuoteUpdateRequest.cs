using DTO.Enums.Submission.SubmissionQuote;

namespace DTO.Submission.SubmissionQuote;

public sealed record SubmissionQuoteUpdateRequest
{
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public decimal Price { get; init; }
    public SubmissionQuotePriceType? PriceType { get; init; }
    public string? PriceTypeOther { get; init; }
    public GlobalIntervalType QuoteValidityIntervalType { get; init; }
    public int QuoteValidityInterval { get; init; }
    public string? TimelineDescription { get; init; }
}
