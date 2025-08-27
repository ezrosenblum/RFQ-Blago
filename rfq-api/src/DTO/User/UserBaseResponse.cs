namespace DTO.User;

public record UserBaseResponse
{
    public int Id { get; init; }
    public string FirstName { get; init; } = null!;
    public string LastName { get; init; } = null!;
    public string? PublicUsername { get; init; }
    public string? Picture { get; set; }
}
