using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories.Responses;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Commands;

public sealed record CategoryUpdateCommand(
    int Id,
    string Name,
    string? Note,
    IReadOnlyCollection<int>? SubcategoriesIds) : ICommand<CategoryResponse>;

public sealed class CategoryUpdateCommandHandler : ICommandHandler<CategoryUpdateCommand, CategoryResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryUpdateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CategoryResponse> Handle(CategoryUpdateCommand command, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Category
            .Include(c => c.Subcategories)
            .FirstOrDefaultAsync(c => c.Id == command.Id, cancellationToken);

        if (category is null)
            throw new NotFoundException("Category not found.");

        var subcategories = new List<Subcategory>();

        if (command.SubcategoriesIds is not null)
        {
            subcategories = await _dbContext.Subcategory
                .Where(s => command.SubcategoriesIds.Contains(s.Id))
                .ToListAsync(cancellationToken);
        }

        category.Update(command.Name, command.Note, subcategories);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryResponse>(category);
    }
}

public sealed class CategoryUpdateCommandValidator : AbstractValidator<CategoryUpdateCommand>
{
    public CategoryUpdateCommandValidator()
    {
        RuleFor(cmd => cmd.Id)
            .NotEmpty();

        RuleFor(cmd => cmd.Name)
            .NotEmpty();
    }
}