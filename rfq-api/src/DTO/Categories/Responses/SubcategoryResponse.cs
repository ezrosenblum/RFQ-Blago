namespace DTO.Categories.Responses;

public record SubcategoryResponse : SubcategoryBaseResponse
{
    public IReadOnlyCollection<CategoryBaseResponse> Categories { get; init; } = new List<CategoryBaseResponse>();
}
