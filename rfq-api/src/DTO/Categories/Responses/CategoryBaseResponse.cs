namespace DTO.Categories.Responses;

public record CategoryBaseResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = null!;
    public string? Note { get; init; }
}
