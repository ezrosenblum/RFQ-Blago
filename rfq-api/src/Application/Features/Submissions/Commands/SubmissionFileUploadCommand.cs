
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.MediaStorage;
using Application.Common.Validation;
using Application.Features.Medias.Validators;
using Application.Features.Validators;
using Domain.Entities.Medias;
using Domain.Entities.Submissions;
using Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionFileUploadCommand(int SubmissionId, IFormFile File) : ICommand;

public sealed record SubmissionFileUploadCommandHandler : ICommandHandler<SubmissionFileUploadCommand>
{
    private readonly IMediaStorage _mediaStorage;
    private readonly IRepository<Submission> _submissionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmissionFileUploadCommandHandler(
        IMediaStorage mediaStorage,
        IRepository<Submission> submissionRepository,
        IUnitOfWork unitOfWork)
    {
        _mediaStorage = mediaStorage;
        _submissionRepository = submissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SubmissionFileUploadCommand command, CancellationToken cancellationToken)
    {
        var submission = await _submissionRepository.GetSafeAsync(command.SubmissionId, cancellationToken);

        await submission.UploadFile(new MediaCreateData(command.File, false, 1), _mediaStorage);

        _submissionRepository.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionFileUploadCommandValidator : BaseAbstractValidator<SubmissionFileUploadCommand>
{
    public SubmissionFileUploadCommandValidator(
        IOptions<MediaConfig> mediaConfigOpt,
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService,
        FileExtensionValidator fileExtensionValidator,
        FileSizeValidator fileSizeValidator)
    {
        var mediaConfig = mediaConfigOpt.Value;

        RuleFor(x => x.SubmissionId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionId))
                        .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionFileUploadCommand.SubmissionId));
                  });

        RuleFor(cmd => FileSizeValidatorData.FromFile(cmd.File, mediaConfig.MaxFileSize))
            .SetValidator(fileSizeValidator)
            .OverridePropertyName(nameof(SubmissionFileUploadCommand.File));


        RuleFor(cmd => FileExtensionValidatorData.FromFile(cmd.File, mediaConfig.AllowedExtensions))
            .SetValidator(fileExtensionValidator)
            .OverridePropertyName(nameof(SubmissionFileUploadCommand.File));
    }
}