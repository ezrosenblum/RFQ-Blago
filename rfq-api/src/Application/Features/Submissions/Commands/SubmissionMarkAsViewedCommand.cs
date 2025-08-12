using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions;
using Domain.Interfaces;
using DTO.Enums.Submission;
using DTO.User;
using FluentValidation;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionMarkAsViewedCommand(int SubmissionId) : ICommand;

public sealed record SubmissionMarkAsViewedCommandHandler : ICommandHandler<SubmissionMarkAsViewedCommand>
{
    private readonly IRepository<Submission> _submissionRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;

    public SubmissionMarkAsViewedCommandHandler(
        IRepository<Submission> submissionRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IDateTime dateTime)
    {
        _submissionRepository = submissionRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public async Task Handle(SubmissionMarkAsViewedCommand command, CancellationToken cancellationToken)
    {
        var submission = await _submissionRepository.GetSafeAsync(command.SubmissionId, cancellationToken);

        if (_currentUserService.UserRole == UserRole.Vendor)
        {
            if (submission.StatusHistory.Any(s => s.VendorId == _currentUserService.UserId &&
                                                 s.Status == SubmissionStatusHistoryType.Viewed))
                return;

            submission.CreateStatusHistory(_currentUserService.UserId!.Value,
                                           SubmissionStatusHistoryType.Viewed,
                                           _dateTime,
                                           true);

            _submissionRepository.Update(submission);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}

public sealed class SubmissionMarkAsViewedCommandValidator : AbstractValidator<SubmissionMarkAsViewedCommand>
{
    public SubmissionMarkAsViewedCommandValidator(
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.SubmissionId)
            .NotNull()
            .NotEmpty()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionId))
                        .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionMarkAsViewedCommand.SubmissionId));
                  });
    }
}