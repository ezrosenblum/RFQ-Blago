using DTO.Enums.Submission;
using DTO.Response;
using DTO.User;

namespace DTO.Submission;

public record SubmissionResponse
{
    public int Id { get; init; }
    public string Description { get; init; } = null!;
    public int Quantity { get; init; }
    public ListItemBaseResponse Unit { get; init; } = new ListItemBaseResponse();
    public ListItemBaseResponse Status { get; init; } = new ListItemBaseResponse();
    public string JobLocation { get; init; } = null!;
    public UserBaseResponse User { get; init; } = new UserBaseResponse();
    public DateTime SubmissionDate { get; init; }
}
