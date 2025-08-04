using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Domain.Entities.Submissions;
using DTO.Enums.Submission;
using FluentValidation;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionCreateCommand(
    string Description,
    int Quantity,
    SubmissionUnit Unit,
    string JobLocation,
    string? StreetAddress,
    double? LatitudeAddress,
    double? LongitudeAddress) : ISubmissionInsertData, ICommand;

public sealed class SubmissionCreateCommandHandler : ICommandHandler<SubmissionCreateCommand>
{
    private readonly IRepository<Submission> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILocalizationService _localizationService;

    public SubmissionCreateCommandHandler(
        IRepository<Submission> repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILocalizationService localizationService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _localizationService = localizationService;
    }

    public async Task Handle(SubmissionCreateCommand command, CancellationToken cancellationToken)
    {
        var currentUserId = GetLoggedUserId();

        Submission newSubmission = Submission.Create(
            command,
            currentUserId);

        await _repository.AddAsync(newSubmission, cancellationToken);
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