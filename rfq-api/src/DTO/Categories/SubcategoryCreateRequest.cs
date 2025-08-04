namespace DTO.Categories;

public sealed class SubcategoryCreateRequest
{
    public string Name { get; init; } = null!;
    public string? Note { get; init; }
    public IReadOnlyCollection<int>? CategoryIds { get; init; }
}
