using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.Categories;
using DTO.Categories.Responses;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Categories.Commands;

public sealed record SubcategoryUpdateCommand(
    int Id,
    string Name,
    string? Note,
    IReadOnlyCollection<int>? CategoryIds
) : ICommand<SubcategoryResponse>;

public sealed class SubcategoryUpdateCommandHandler : ICommandHandler<SubcategoryUpdateCommand, SubcategoryResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SubcategoryUpdateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SubcategoryResponse> Handle(SubcategoryUpdateCommand command, CancellationToken cancellationToken)
    {
        var subcategory = await _dbContext.Subcategory
            .Include(s => s.Categories)
            .FirstOrDefaultAsync(s => s.Id == command.Id, cancellationToken);

        if (subcategory is null)
            throw new NotFoundException("Subcategory not found.");

        var categories = new List<Category>();

        if (command.CategoryIds is not null)
        {
            categories = await _dbContext.Category
                .Where(c => command.CategoryIds.Contains(c.Id))
                .ToListAsync(cancellationToken);
        }

        subcategory.Update(command.Name, command.Note, categories);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SubcategoryResponse>(subcategory);
    }
}

public sealed class SubcategoryUpdateCommandValidator : AbstractValidator<SubcategoryUpdateCommand>
{
    public SubcategoryUpdateCommandValidator()
    {
        RuleFor(cmd => cmd.Id)
            .NotEmpty();

        RuleFor(cmd => cmd.Name)
            .NotEmpty();
    }
}