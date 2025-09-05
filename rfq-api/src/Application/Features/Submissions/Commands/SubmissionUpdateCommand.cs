using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Categories;
using Domain.Entities.Submissions;
using DTO.Enums.Submission;
using DTO.User;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionUpdateCommand(
    int Id,
    string Title,
    string Description,
    int Quantity,
    SubmissionUnit Unit,
    string JobLocation,
    string? StreetAddress,
    double? LatitudeAddress,
    double? LongitudeAddress,
    IReadOnlyCollection<int>? CategoriesIds,
    IReadOnlyCollection<int>? SubCategoriesIds) : ISubmissionInsertData, ICommand;

public sealed class SubmissionUpdateCommandHandler : ICommandHandler<SubmissionUpdateCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILocalizationService _localizationService;

    public SubmissionUpdateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILocalizationService localizationService)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _localizationService = localizationService;
    }

    public async Task Handle(SubmissionUpdateCommand command, CancellationToken cancellationToken)
    {
        var categories = command.CategoriesIds != null ? await _dbContext.Category.Where(s => command.CategoriesIds.Contains(s.Id)).ToListAsync(cancellationToken)
                                                       : new List<Category>();

        var subCategories = command.SubCategoriesIds != null ? await _dbContext.Subcategory.Where(s => command.SubCategoriesIds.Contains(s.Id)).ToListAsync(cancellationToken)
                                                             : new List<Subcategory>();

        var submission = await _dbContext.Submission
            .Include(s => s.Categories)
            .Include(s => s.Subcategories)
            .FirstOrDefaultAsync(s => s.Id == command.Id && 
                                      (_currentUserService.UserRole == UserRole.Administrator ||
                                       s.UserId == _currentUserService.UserId), 
                                       cancellationToken);

        if(submission == null)
            throw new UnauthorizedAccessException(_localizationService.GetValue("submission.unauthorized.error.message"));

        submission.Update(
            command,
            categories,
            subCategories);

        _dbContext.Submission.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionUpdateCommandValidator : AbstractValidator<SubmissionUpdateCommand>
{
    public SubmissionUpdateCommandValidator(
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.Id)
            .NotNull()
            .NotEmpty()
            .DependentRules(
            () =>
            {
                RuleFor(x => new EntityExistsValidatorData(x.Id))
                    .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                    .OverridePropertyName(nameof(SubmissionUpdateCommand.Id));
            });

        RuleFor(cmd => cmd.Title)
            .NotEmpty();

        RuleFor(cmd => cmd.Description)
            .NotEmpty();

        RuleFor(cmd => cmd.Quantity)
            .NotEmpty();

        RuleFor(cmd => cmd.Unit)
            .NotEmpty()
            .IsInEnum();

        RuleFor(cmd => cmd.JobLocation)
            .NotEmpty();


    }
}