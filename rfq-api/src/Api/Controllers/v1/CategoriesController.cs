using Application.Features.Categories.Commands;
using Application.Features.Categories.Queries;
using AutoMapper;
using DTO.Categories;
using DTO.Categories.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

public class CategoriesController : ApiControllerBase
{
    private readonly IMapper _mapper;

    public CategoriesController(IMapper mapper)
    {
        _mapper = mapper;
    }

    [HttpPost("category")]
    public async Task<CategoryResponse> CreateCategory([FromBody] CategoryCreateRequest request)
    {
        var command = _mapper.Map<CategoryCreateCommand>(request);
        return await Mediator.Send(command);
    }

    [HttpPut("category/{id:int}")]
    public async Task<CategoryResponse> UpdateCategory([FromRoute] int id, [FromBody] CategoryUpdateRequest request)
    {
        var command = _mapper.Map<CategoryUpdateCommand>(request) with { Id = id };
        return await Mediator.Send(command);
    }

    [AllowAnonymous]
    [HttpGet("categories")]
    public async Task<IReadOnlyCollection<CategoryResponse>> GetAllCategories()
    {
        return await Mediator.Send(new CategoryGetAllQuery());
    }

    [HttpGet("category/{id:int}")]
    public async Task<CategoryResponse> GetByIdCategory(int id)
    {
        return await Mediator.Send(new CategoryGetByIdQuery(id));
    }

    [HttpPost("subcategory")]
    public async Task<SubcategoryResponse> CreateSubcategory([FromBody] SubcategoryCreateRequest request)
    {
        var command = _mapper.Map<SubcategoryCreateCommand>(request);
        return await Mediator.Send(command);
    }

    [HttpPut("subcategory/{id:int}")]
    public async Task<SubcategoryResponse> UpdateSubcategory([FromRoute] int id, [FromBody] SubcategoryUpdateRequest request)
    {
        var command = _mapper.Map<SubcategoryUpdateCommand>(request) with { Id = id };
        return await Mediator.Send(command);
    }

    [AllowAnonymous]
    [HttpGet("subcategories")]
    public async Task<IReadOnlyCollection<SubcategoryResponse>> GetAllSubcategories()
    {
        return await Mediator.Send(new SubcategoryGetAllQuery());
    }

    [HttpGet("subcategory/{id:int}")]
    public async Task<SubcategoryResponse> GetSubcategoryById(int id)
    {
        return await Mediator.Send(new SubcategoryGetByIdQuery(id));
    }
}
