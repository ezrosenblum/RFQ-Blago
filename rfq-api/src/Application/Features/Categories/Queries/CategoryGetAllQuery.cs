using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Categories.Responses;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Queries;

public sealed record CategoryGetAllQuery() : IQuery<IReadOnlyCollection<CategoryResponse>>;

public sealed class CategoryGetAllQueryHandler : IQueryHandler<CategoryGetAllQuery, IReadOnlyCollection<CategoryResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public CategoryGetAllQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<CategoryResponse>> Handle(CategoryGetAllQuery query, CancellationToken cancellationToken)
    {
        var categories = await _dbContext.Category
            .Include(c => c.Subcategories)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IReadOnlyCollection<CategoryResponse>>(categories);
    }
}