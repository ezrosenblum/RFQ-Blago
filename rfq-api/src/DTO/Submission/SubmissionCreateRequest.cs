using DTO.Enums.Submission;

namespace DTO.Submission;

public sealed record SubmissionCreateRequest
{
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public int Quantity { get; init; }
    public SubmissionUnit Unit { get; init; }
    public string JobLocation { get; init; } = null!;
    public string? StreetAddress { get; init; }
    public double? LatitudeAddress { get; init; }
    public double? LongitudeAddress { get; init; }
    public IReadOnlyCollection<int>? CategoriesIds { get; init; }
    public IReadOnlyCollection<int>? SubCategoriesIds { get; init; }
}
