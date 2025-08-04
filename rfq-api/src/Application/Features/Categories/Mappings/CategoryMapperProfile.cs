using Application.Features.Categories.Commands;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories;
using DTO.Categories.Responses;

namespace Application.Features.Categories.Mappings;

public sealed class CategoryMapperProfile : Profile
{
    public CategoryMapperProfile()
    {
        CreateMap<Category, CategoryResponse>();
        CreateMap<CategoryResponse, Category>();

        CreateMap<Category, CategoryBaseResponse>();
        CreateMap<CategoryBaseResponse, Category>();


        CreateMap<CategoryCreateRequest, CategoryCreateCommand>();
        CreateMap<CategoryUpdateRequest, CategoryUpdateCommand>()
            .ConstructUsing(src => new CategoryUpdateCommand(
                default,
                src.Name,
                src.Note,
                src.SubcategoriesIds));
    }
}
