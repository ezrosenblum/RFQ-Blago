using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Categories.Responses;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Queries;

public sealed record SubcategoryGetAllQuery() : IQuery<IReadOnlyCollection<SubcategoryResponse>>;

public sealed class SubcategoryGetAllQueryHandler : IQueryHandler<SubcategoryGetAllQuery, IReadOnlyCollection<SubcategoryResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public SubcategoryGetAllQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<SubcategoryResponse>> Handle(SubcategoryGetAllQuery query, CancellationToken cancellationToken)
    {
        var subcategories = await _dbContext.Subcategory
            .Include(s => s.Categories)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IReadOnlyCollection<SubcategoryResponse>>(subcategories);
    }
}
