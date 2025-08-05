namespace DTO.Categories.Responses;

public record CategoryResponse : CategoryBaseResponse
{
    public IReadOnlyCollection<SubcategoryBaseResponse> Subcategories { get; init; } = new List<SubcategoryBaseResponse>();
}
