using DTO.Response;

namespace DTO.User;

public sealed record MeResponse : UserInfoResponse
{
    public string? ProfilePicture { get; set; }
    public List<ListItemBaseResponse> Categories { get; init; } = new();
    public List<ListItemBaseResponse> Subcategories { get; init; } = new();
}
