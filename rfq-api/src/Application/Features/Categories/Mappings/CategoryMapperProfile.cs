using Application.Features.Categories.Commands;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories;
using DTO.Categories.Responses;
using DTO.Response;

namespace Application.Features.Categories.Mappings;

public sealed class CategoryMapperProfile : Profile
{
    public CategoryMapperProfile()
    {
        CreateMap<Category, CategoryResponse>();
        CreateMap<CategoryResponse, Category>();

        CreateMap<Category, CategoryBaseResponse>();
        CreateMap<CategoryBaseResponse, Category>();

        CreateMap<Category, ListItemBaseResponse>()
            .ForMember(s => s.Name, opt => opt.MapFrom(d => d.Name));
        CreateMap<Subcategory, ListItemBaseResponse>()
            .ForMember(s => s.Name, opt => opt.MapFrom(d => d.Name));

        CreateMap<CategoryCreateRequest, CategoryCreateCommand>();
        CreateMap<CategoryUpdateRequest, CategoryUpdateCommand>()
            .ConstructUsing(src => new CategoryUpdateCommand(
                default,
                src.Name,
                src.Note,
                src.SubcategoriesIds));
    }
}
