using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.Validation;
using Application.Features.Validators;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Interfaces;
using FluentValidation;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;


public sealed record SubmissionQuoteFileRemoveCommand(int SubmissionQuoteId, Guid FileId) : ICommand;

public sealed record SubmissionQuoteFileRemoveCommandHandler : ICommandHandler<SubmissionQuoteFileRemoveCommand>
{
    public readonly IMediaStorage _mediaStorage;
    public readonly IRepository<SubmissionQuote> _submissionQuoteRepository;
    public readonly IUnitOfWork _unitOfWork;

    public SubmissionQuoteFileRemoveCommandHandler(
        IMediaStorage mediaStorage,
        IRepository<SubmissionQuote> SubmissionQuoteRepository,
        IUnitOfWork unitOfWork)
    {
        _mediaStorage = mediaStorage;
        _submissionQuoteRepository = SubmissionQuoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SubmissionQuoteFileRemoveCommand command, CancellationToken cancellationToken)
    {
        var submissionQuote = await _submissionQuoteRepository.GetSafeAsync(command.SubmissionQuoteId, cancellationToken);

        await submissionQuote.RemoveFile(command.FileId, _mediaStorage);

        _submissionQuoteRepository.Update(submissionQuote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionQuoteFileRemoveCommandValidator : BaseAbstractValidator<SubmissionQuoteFileRemoveCommand>
{
    public SubmissionQuoteFileRemoveCommandValidator(
        IRepository<SubmissionQuote> submissionQuoteRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.SubmissionQuoteId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionQuoteId))
                        .SetValidator(new EntityExistsValidator<SubmissionQuote>(submissionQuoteRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionQuoteFileRemoveCommand.SubmissionQuoteId));
                  });
    }
}