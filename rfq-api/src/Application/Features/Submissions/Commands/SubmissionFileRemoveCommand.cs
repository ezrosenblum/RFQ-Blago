using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.Validation;
using Application.Features.Validators;
using Domain.Entities.Submissions;
using Domain.Interfaces;
using FluentValidation;

namespace Application.Features.Submissions.Commands;


public sealed record SubmissionFileRemoveCommand(int SubmissionId, Guid FileId) : ICommand;

public sealed record SubmissionFileRemoveCommandHandler : ICommandHandler<SubmissionFileRemoveCommand>
{
    public readonly IMediaStorage _mediaStorage;
    public readonly IRepository<Submission> _submissionRepository;
    public readonly IUnitOfWork _unitOfWork;

    public SubmissionFileRemoveCommandHandler(
        IMediaStorage mediaStorage,
        IRepository<Submission> submissionRepository,
        IUnitOfWork unitOfWork)
    {
        _mediaStorage = mediaStorage;
        _submissionRepository = submissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SubmissionFileRemoveCommand command, CancellationToken cancellationToken)
    {
        var submission = await _submissionRepository.GetSafeAsync(command.SubmissionId, cancellationToken);

        await submission.RemoveFile(command.FileId, _mediaStorage);

        _submissionRepository.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionFileRemoveCommandValidator : BaseAbstractValidator<SubmissionFileRemoveCommand>
{
    public SubmissionFileRemoveCommandValidator(
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.SubmissionId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionId))
                        .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionFileRemoveCommand.SubmissionId));
                  });
    }
}