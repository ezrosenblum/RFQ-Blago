using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Domain.Entities.Categories;
using Domain.Entities.Submissions;
using DTO.Enums.Submission;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionCreateCommand(
    string Title,
    string Description,
    int Quantity,
    SubmissionUnit Unit,
    string JobLocation,
    string? StreetAddress,
    double? LatitudeAddress,
    double? LongitudeAddress,
    IReadOnlyCollection<int>? CategoriesIds,
    IReadOnlyCollection<int>? SubCategoriesIds,
    List<IFormFile>? Files) : ISubmissionInsertData, ICommand;

public sealed class SubmissionCreateCommandHandler : ICommandHandler<SubmissionCreateCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILocalizationService _localizationService;

    public SubmissionCreateCommandHandler(
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

    public async Task Handle(SubmissionCreateCommand command, CancellationToken cancellationToken)
    {
        var currentUserId = GetLoggedUserId();

        var categories = command.CategoriesIds != null ? await _dbContext.Category.Where(s => command.CategoriesIds.Contains(s.Id)).ToListAsync(cancellationToken) 
                                                       : new List<Category>();

        var subCategories = command.SubCategoriesIds != null ? await _dbContext.Subcategory.Where(s => command.SubCategoriesIds.Contains(s.Id)).ToListAsync(cancellationToken) 
                                                             : new List<Subcategory>();

        Submission newSubmission = Submission.Create(
            command,
            categories,
            subCategories,
            command.Files,
            currentUserId);

        await _dbContext.Submission.AddAsync(newSubmission, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private int GetLoggedUserId()
    {
        var currentUserId = _currentUserService.UserId;

        if (currentUserId == null ||
            currentUserId == 0)
            throw new UnauthorizedAccessException(_localizationService.GetValue("user.notAuthenticader.error.message"));

        return currentUserId.Value;
    }
}

public sealed class NotificationCreateCommandValidator : AbstractValidator<SubmissionCreateCommand>
{
    public NotificationCreateCommandValidator()
    {
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