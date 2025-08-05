namespace DTO.Categories;

public sealed class CategoryUpdateRequest
{
    public string Name { get; init; } = null!;
    public string? Note { get; init; }
    public IReadOnlyCollection<int>? SubcategoriesIds { get; init; }
}