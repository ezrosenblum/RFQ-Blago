using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Submission;
using DTO.Enums.Submission.SubmissionQuote;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteStatusChangeCommand(
    int Id,
    SubmissionQuoteStatus Status) : ICommand;

public sealed class SubmissionQuoteStatusChangeCommandHandler : ICommandHandler<SubmissionQuoteStatusChangeCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;

    public SubmissionQuoteStatusChangeCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
    }


    public async Task Handle(SubmissionQuoteStatusChangeCommand command, CancellationToken cancellationToken)
    {
        var submissionQuote = await _dbContext.SubmissionQuote
            .Include(s => s.Submission)
            .FirstAsync(s => s.Id == command.Id, cancellationToken);

        submissionQuote.ChangeStatus(command.Status);

        if (command.Status == SubmissionQuoteStatus.Accepted)
            submissionQuote.Submission.ChangeStatus(SubmissionStatus.Completed);

        _dbContext.SubmissionQuote.Update(submissionQuote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionQuoteStatusChangeCommandValidator : AbstractValidator<SubmissionQuoteStatusChangeCommand>
{
    public SubmissionQuoteStatusChangeCommandValidator(
        IRepository<SubmissionQuote> submissionQuoteRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.Id)
            .NotNull()
            .NotEmpty()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.Id))
                        .SetValidator(new EntityExistsValidator<SubmissionQuote>(submissionQuoteRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionQuoteStatusChangeCommand.Id));
                  });

        RuleFor(cmd => cmd.Status)
            .NotEmpty()
            .IsInEnum();
    }
}