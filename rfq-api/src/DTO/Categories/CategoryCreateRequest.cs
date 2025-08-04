namespace DTO.Categories;

public sealed record CategoryCreateRequest
{
    public string Name { get; init; } = null!;
    public string? Note { get; init; }
    public IReadOnlyCollection<int>? SubcategoriesIds { get; init; }
}
