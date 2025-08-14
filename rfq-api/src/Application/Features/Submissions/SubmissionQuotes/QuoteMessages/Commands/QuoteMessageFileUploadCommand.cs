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
using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Application.Features.QuoteMessages.QuoteMessageQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageFileUploadCommand(int QuoteMessageId, IFormFile File) : ICommand;

public sealed record QuoteMessageFileUploadCommandHandler : ICommandHandler<QuoteMessageFileUploadCommand>
{
    private readonly IMediaStorage _mediaStorage;
    private readonly IRepository<QuoteMessage> _quoteMessageRepository;
    private readonly IUnitOfWork _unitOfWork;

    public QuoteMessageFileUploadCommandHandler(
        IMediaStorage mediaStorage,
        IRepository<QuoteMessage> quoteMessageRepository,
        IUnitOfWork unitOfWork)
    {
        _mediaStorage = mediaStorage;
        _quoteMessageRepository = quoteMessageRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(QuoteMessageFileUploadCommand command, CancellationToken cancellationToken)
    {
        var quoteMessage = await _quoteMessageRepository.GetSafeAsync(command.QuoteMessageId, cancellationToken);

        await quoteMessage.UploadFile(new MediaCreateData(command.File, false, 1), _mediaStorage);

        _quoteMessageRepository.Update(quoteMessage);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class QuoteMessageFileUploadCommandValidator : BaseAbstractValidator<QuoteMessageFileUploadCommand>
{
    public QuoteMessageFileUploadCommandValidator(
        IOptions<MediaConfig> mediaConfigOpt,
        IRepository<QuoteMessage> quoteMessageRepository,
        ILocalizationService localizationService,
        FileExtensionValidator fileExtensionValidator,
        FileSizeValidator fileSizeValidator)
    {
        var mediaConfig = mediaConfigOpt.Value;

        RuleFor(x => x.QuoteMessageId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.QuoteMessageId))
                        .SetValidator(new EntityExistsValidator<QuoteMessage>(quoteMessageRepository, localizationService))
                        .OverridePropertyName(nameof(QuoteMessageFileUploadCommand.QuoteMessageId));
                  });

        RuleFor(cmd => FileSizeValidatorData.FromFile(cmd.File, mediaConfig.MaxFileSize))
            .SetValidator(fileSizeValidator)
            .OverridePropertyName(nameof(QuoteMessageFileUploadCommand.File));


        RuleFor(cmd => FileExtensionValidatorData.FromFile(cmd.File, mediaConfig.AllowedExtensions))
            .SetValidator(fileExtensionValidator)
            .OverridePropertyName(nameof(QuoteMessageFileUploadCommand.File));
    }
}
