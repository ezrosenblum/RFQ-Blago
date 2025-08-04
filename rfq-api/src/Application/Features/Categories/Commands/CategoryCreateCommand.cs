using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories.Responses;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Commands;

public sealed record CategoryCreateCommand(
    string Name,
    string? Note,
    IReadOnlyCollection<int>? SubcategoriesIds) : ICommand<CategoryResponse>;

public sealed class CategoryCreateCommandHandler : ICommandHandler<CategoryCreateCommand, CategoryResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryCreateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CategoryResponse> Handle(CategoryCreateCommand command, CancellationToken cancellationToken)
    {
        var subcategories = new List<Subcategory>();

        if (command.SubcategoriesIds is not null && command.SubcategoriesIds.Any())
        {
            subcategories = await _dbContext.Subcategory
            .Where(s => command.SubcategoriesIds!.Contains(s.Id))
            .ToListAsync(cancellationToken);
        }
        
        var category = Category.Create(command.Name, command.Note, subcategories);

        await _dbContext.Category.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryResponse>(category);
    }
}

public sealed class CategoryCreateCommandValidator : AbstractValidator<CategoryCreateCommand>
{
    public CategoryCreateCommandValidator()
    {
        RuleFor(cmd => cmd.Name)
            .NotEmpty();
    }
}
