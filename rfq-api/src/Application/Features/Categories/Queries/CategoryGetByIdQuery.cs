using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Categories.Responses;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Queries;

public sealed record CategoryGetByIdQuery(int Id) : IQuery<CategoryResponse>;

public sealed class CategoryGetByIdQueryHandler : IQueryHandler<CategoryGetByIdQuery, CategoryResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public CategoryGetByIdQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<CategoryResponse> Handle(CategoryGetByIdQuery query, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Category
            .Include(c => c.Subcategories)
            .FirstOrDefaultAsync(c => c.Id == query.Id, cancellationToken);

        if (category is null)
            throw new NotFoundException("Category not found.");

        return _mapper.Map<CategoryResponse>(category);
    }
}

public sealed class CategoryGetByIdQueryValidator : AbstractValidator<CategoryGetByIdQuery>
{
    public CategoryGetByIdQueryValidator()
    {
        RuleFor(q => q.Id)
            .NotEmpty();
    }
}