using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Submission.SubmissionQuote;
using FluentValidation;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteCreateCommand(
    string Title,
    string Description,
    decimal Price,
    SubmissionQuoteValidityIntervalType QuoteValidityIntervalType,
    int QuoteValidityInterval,
    int SubmissionId,
    int VendorId) : ISubmissionQuoteInsertData, ICommand;

public sealed class SubmissionQuoteCreateCommandHandler : ICommandHandler<SubmissionQuoteCreateCommand>
{
    private readonly IRepository<SubmissionQuote> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public SubmissionQuoteCreateCommandHandler(
        IRepository<SubmissionQuote> repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILocalizationService localizationService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(SubmissionQuoteCreateCommand command, CancellationToken cancellationToken)
    {
        SubmissionQuote newSubmissionQuote = SubmissionQuote.Create(command with { VendorId = _currentUserService.UserId!.Value});

        await _repository.AddAsync(newSubmissionQuote, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class NotificationCreateCommandValidator : AbstractValidator<SubmissionQuoteCreateCommand>
{
    public NotificationCreateCommandValidator(
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService)
    {
        RuleFor(cmd => cmd.Title)
            .NotEmpty();

        RuleFor(cmd => cmd.Description)
            .NotEmpty();

        RuleFor(cmd => cmd.Price)
            .NotNull();

        RuleFor(cmd => cmd.QuoteValidityIntervalType)
            .NotEmpty()
            .IsInEnum();

        RuleFor(cmd => cmd.QuoteValidityInterval)
            .NotEmpty();

        RuleFor(cmd => cmd.SubmissionId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionId))
                        .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionQuoteCreateCommand.SubmissionId));
                  });

    }
}