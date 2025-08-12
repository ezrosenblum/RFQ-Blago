using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.Localization.Extensions;
using Application.Features.Validators;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Domain.Interfaces;
using DTO.Enums.Submission;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageCreateCommand(
    string? Content,
    int SubmissionQuoteId,
    int SenderId,
    List<IFormFile> Files) : IQuoteMessageInsertData, ICommand;

public sealed class QuoteMessageCreateCommandHandler : ICommandHandler<QuoteMessageCreateCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTime _dateTime;

    public QuoteMessageCreateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IDateTime dateTime)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task Handle(QuoteMessageCreateCommand command, CancellationToken cancellationToken)
    {
        var newQuoteMessage = QuoteMessage.Create(
            command,
            command.Files);

        await _dbContext.QuoteMessage.AddAsync(newQuoteMessage, cancellationToken);

        await ChangeStatusIfNeeded(command.SubmissionQuoteId, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ChangeStatusIfNeeded(int submissionQuoteId, CancellationToken cancellationToken = default)
    {
        var submissionQuote = await _dbContext.SubmissionQuote
            .Include(sq => sq.Submission)
            .FirstAsync(sq => sq.Id == submissionQuoteId, cancellationToken);

        var submission = submissionQuote.Submission;

        if (!submission.StatusHistory.Any(s => s.VendorId == submissionQuote.VendorId &&
                                               s.Status == SubmissionStatusHistoryType.Engaged))
        {
            submission.CreateStatusHistory(
                submissionQuote.VendorId,
                SubmissionStatusHistoryType.Engaged,
                _dateTime,
                true);

            _dbContext.Submission.Update(submission);
        }
    }
}

public sealed class QuoteMessageCreateCommandValidator : AbstractValidator<QuoteMessageCreateCommand>
{

    public QuoteMessageCreateCommandValidator(
        IRepository<SubmissionQuote> submissionQuoteRepository,
        ILocalizationService localizationService)
    {
        RuleFor(cmd => cmd.Files)
            .Must(files => files != null && files.Any())
            .When(cmd => string.IsNullOrWhiteSpace(cmd.Content))
            .WithLocalizationKey("contentOrFile.needed.error.message");

        RuleFor(cmd => cmd.SubmissionQuoteId)
            .NotNull()
            .DependentRules(
            () =>
            {
                RuleFor(x => new EntityExistsValidatorData(x.SubmissionQuoteId))
                    .SetValidator(new EntityExistsValidator<SubmissionQuote>(submissionQuoteRepository, localizationService))
                    .OverridePropertyName(nameof(QuoteMessageCreateCommand.SubmissionQuoteId));
            });


    }
}