using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories.Responses;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Commands;

public sealed record SubcategoryCreateCommand(
    string Name,
    string? Note,
    IReadOnlyCollection<int>? CategoryIds
) : ICommand<SubcategoryResponse>;

public sealed class SubcategoryCreateCommandHandler : ICommandHandler<SubcategoryCreateCommand, SubcategoryResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SubcategoryCreateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SubcategoryResponse> Handle(SubcategoryCreateCommand command, CancellationToken cancellationToken)
    {
        var categories = new List<Category>();

        if (command.CategoryIds is not null && command.CategoryIds.Any())
        {
            categories = await _dbContext.Category
                .Where(c => command.CategoryIds.Contains(c.Id))
                .ToListAsync(cancellationToken);
        }

        var subcategory = Subcategory.Create(command.Name, command.Note, categories);

        await _dbContext.Subcategory.AddAsync(subcategory, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SubcategoryResponse>(subcategory);
    }
}

public sealed class SubcategoryCreateCommandValidator : AbstractValidator<SubcategoryCreateCommand>
{
    public SubcategoryCreateCommandValidator()
    {
        RuleFor(cmd => cmd.Name)
            .NotEmpty();
    }
}