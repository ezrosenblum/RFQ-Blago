using Application.Features.Categories.Commands;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories;
using DTO.Categories.Responses;

namespace Application.Features.Categories.Mappings;

public sealed class SubcategoryMapperProfile : Profile
{
    public SubcategoryMapperProfile()
    {
        CreateMap<Subcategory, SubcategoryResponse>();
        CreateMap<SubcategoryResponse, Subcategory>();

        CreateMap<Subcategory, SubcategoryBaseResponse>();
        CreateMap<SubcategoryBaseResponse, Subcategory>();

        CreateMap<SubcategoryCreateRequest, SubcategoryCreateCommand>();
        CreateMap<SubcategoryUpdateRequest, SubcategoryUpdateCommand>()
            .ConstructUsing(src => new SubcategoryUpdateCommand(
                default,
                src.Name,
                src.Note,
                src.CategoryIds));
    }
}
