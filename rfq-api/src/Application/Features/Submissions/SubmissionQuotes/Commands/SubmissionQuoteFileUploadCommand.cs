
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
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteFileUploadCommand(int SubmissionQuoteId, IFormFile File) : ICommand;

public sealed record SubmissionQuoteFileUploadCommandHandler : ICommandHandler<SubmissionQuoteFileUploadCommand>
{
    public readonly IMediaStorage _mediaStorage;
    public readonly IRepository<SubmissionQuote> _submissionQuoteRepository;
    public readonly IUnitOfWork _unitOfWork;

    public SubmissionQuoteFileUploadCommandHandler(
        IMediaStorage mediaStorage,
        IRepository<SubmissionQuote> submissionQuoteRepository,
        IUnitOfWork unitOfWork)
    {
        _mediaStorage = mediaStorage;
        _submissionQuoteRepository = submissionQuoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SubmissionQuoteFileUploadCommand command, CancellationToken cancellationToken)
    {
        var submissionQuote = await _submissionQuoteRepository.GetSafeAsync(command.SubmissionQuoteId, cancellationToken);

        await submissionQuote.UploadFile(new MediaCreateData(command.File, false, 1), _mediaStorage);

        _submissionQuoteRepository.Update(submissionQuote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionQuoteFileUploadCommandValidator : BaseAbstractValidator<SubmissionQuoteFileUploadCommand>
{
    public SubmissionQuoteFileUploadCommandValidator(
        IOptions<MediaConfig> mediaConfigOpt,
        IRepository<SubmissionQuote> submissionQuoteRepository,
        ILocalizationService localizationService,
        FileExtensionValidator fileExtensionValidator,
        FileSizeValidator fileSizeValidator)
    {
        var mediaConfig = mediaConfigOpt.Value;

        RuleFor(x => x.SubmissionQuoteId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionQuoteId))
                        .SetValidator(new EntityExistsValidator<SubmissionQuote>(submissionQuoteRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionQuoteFileUploadCommand.SubmissionQuoteId));
                  });

        RuleFor(cmd => FileSizeValidatorData.FromFile(cmd.File, mediaConfig.MaxFileSize))
            .SetValidator(fileSizeValidator)
            .OverridePropertyName(nameof(SubmissionQuoteFileUploadCommand.File));


        RuleFor(cmd => FileExtensionValidatorData.FromFile(cmd.File, mediaConfig.AllowedExtensions))
            .SetValidator(fileExtensionValidator)
            .OverridePropertyName(nameof(SubmissionQuoteFileUploadCommand.File));
    }
}