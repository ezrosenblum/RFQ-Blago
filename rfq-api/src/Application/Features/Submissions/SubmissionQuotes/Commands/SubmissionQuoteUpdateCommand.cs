using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.Validation;
using Application.Features.Validators;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Submission.SubmissionQuote;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteUpdateCommand(
    int SubmissionQuoteId,
    string Title,
    string Description,
    decimal Price,
    SubmissionQuotePriceType? PriceType,
    string? PriceTypeOther,
    GlobalIntervalType QuoteValidityIntervalType,
    int QuoteValidityInterval,
    string? TimelineDescription) : ISubmissionQuoteUpdateData, ICommand;

public sealed class SubmissionQuoteUpdateCommandHandler : ICommandHandler<SubmissionQuoteUpdateCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _dbContext;
    private readonly ILocalizationService _localizationService;

    public SubmissionQuoteUpdateCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILocalizationService localizationService,
        IApplicationDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _localizationService = localizationService;
    }

    public async Task Handle(SubmissionQuoteUpdateCommand command, CancellationToken cancellationToken)
    {
        var submissionQuote = await _dbContext.SubmissionQuote
            .FirstOrDefaultAsync(s => s.Id == command.SubmissionQuoteId &&
                                      s.CreatedBy == _currentUserService.UserId,
                                      cancellationToken);

        if (submissionQuote == null)
            throw new UnauthorizedAccessException(_localizationService.GetValue("submissionQuote.unauthorized.error.message"));

        submissionQuote.Update(command);

        _dbContext.SubmissionQuote.Update(submissionQuote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionQuoteUpdateCommandValidator : BaseAbstractValidator<SubmissionQuoteUpdateCommand>
{
    public SubmissionQuoteUpdateCommandValidator(
        IRepository<SubmissionQuote> submissionQuoteRepository,
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

        RuleFor(cmd => cmd.SubmissionQuoteId)
            .NotNull()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionQuoteId))
                        .SetValidator(new EntityExistsValidator<SubmissionQuote>(submissionQuoteRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionQuoteUpdateCommand.SubmissionQuoteId));
                  });
    }
}