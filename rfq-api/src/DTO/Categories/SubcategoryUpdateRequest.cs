namespace DTO.Categories;

public sealed class SubcategoryUpdateRequest
{
    public string Name { get; init; } = null!;
    public string? Note { get; init; }
    public IReadOnlyCollection<int>? CategoryIds { get; init; }
}
