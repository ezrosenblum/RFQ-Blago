using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionUpdateCategoriesCommand(
    int SubmissionId,
    IReadOnlyCollection<int> CategoriesIds,
    IReadOnlyCollection<int> SubcategoriesIds) : ICommand;

public sealed class SubmissionUpdateCategoriesCommandHandler : ICommandHandler<SubmissionUpdateCategoriesCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    public SubmissionUpdateCategoriesCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
    }
    public async Task Handle(SubmissionUpdateCategoriesCommand command, CancellationToken cancellationToken)
    {
        var submission = await _dbContext.Submission
            .Include(u => u.Categories)
            .Include(u => u.Subcategories)
            .FirstAsync(u =>
                u.Id == command.SubmissionId,
                cancellationToken);

        var categories = await _dbContext.Category
            .Where(c => command.CategoriesIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        var subcategories = await _dbContext.Subcategory
            .Where(s => command.SubcategoriesIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        submission.SetCategories(categories, subcategories);

        _dbContext.Submission.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionUpdateCategoriesCommandValidator : AbstractValidator<SubmissionUpdateCategoriesCommand>
{
    public SubmissionUpdateCategoriesCommandValidator(
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService)
    {

        RuleFor(cmd => cmd.SubmissionId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionId))
                        .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionUpdateCategoriesCommand.SubmissionId));
                  });

    }
}