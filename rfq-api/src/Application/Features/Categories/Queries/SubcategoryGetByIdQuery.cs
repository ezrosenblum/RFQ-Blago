using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using DTO.Categories.Responses;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Queries;

public sealed record SubcategoryGetByIdQuery(int Id) : IQuery<SubcategoryResponse>;

public sealed class SubcategoryGetByIdQueryHandler : IQueryHandler<SubcategoryGetByIdQuery, SubcategoryResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public SubcategoryGetByIdQueryHandler(IApplicationDbContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<SubcategoryResponse> Handle(SubcategoryGetByIdQuery query, CancellationToken cancellationToken)
    {
        var subcategory = await _dbContext.Subcategory
            .Include(s => s.Categories)
            .FirstOrDefaultAsync(s => s.Id == query.Id, cancellationToken);

        if (subcategory is null)
            throw new NotFoundException("Subcategory not found.");

        return _mapper.Map<SubcategoryResponse>(subcategory);
    }
}

public sealed class SubcategoryGetByIdQueryValidator : AbstractValidator<SubcategoryGetByIdQuery>
{
    public SubcategoryGetByIdQueryValidator()
    {
        RuleFor(q => q.Id)
            .NotEmpty();
    }
}
