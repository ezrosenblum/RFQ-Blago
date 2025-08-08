using DTO.Medias;
using DTO.Response;
using DTO.User;
namespace DTO.Submission;

public record SubmissionBaseResponse
{
    public int Id { get; init; }
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public int Quantity { get; init; }
    public ListItemBaseResponse Unit { get; init; } = new();
    public ListItemBaseResponse Status { get; init; } = new();
    public string JobLocation { get; init; } = null!;
    public UserBaseResponse User { get; init; } = new();
    public DateTime SubmissionDate { get; init; }
    public bool IsValid { get; init; }
    public MediaResponse Media { get; init; } = new();
    public string? StreetAddress { get; init; }
    public double? LatitudeAddress { get; init; }
    public double? LongitudeAddress { get; init; }

}
