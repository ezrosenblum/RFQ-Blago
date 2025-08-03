using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions;
using DTO.Enums.Submission;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Commands;

public sealed record SubmissionStatusChangeCommand(
    int Id, 
    SubmissionStatus Status) : ICommand;

public sealed class SubmissionStatusChangeCommandHandler : ICommandHandler<SubmissionStatusChangeCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILocalizationService _localizationService;

    public SubmissionStatusChangeCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        ILocalizationService localizationService)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
    }


    public async Task Handle(SubmissionStatusChangeCommand command, CancellationToken cancellationToken)
    {
        var submission = await _dbContext.Submission
            .Include(d => d.User)
            .FirstAsync(s => s.Id == command.Id, cancellationToken);

        submission.ChangeStatus(command.Status);

        _dbContext.Submission.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionStatusChangeCommandValidator : AbstractValidator<SubmissionStatusChangeCommand>
{
    public SubmissionStatusChangeCommandValidator(
        IRepository<Submission> submissionRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.Id)
            .NotNull()
            .NotEmpty()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.Id))
                        .SetValidator(new EntityExistsValidator<Submission>(submissionRepository, localizationService))
                        .OverridePropertyName(nameof(SubmissionStatusChangeCommand.Id));
                  });

        RuleFor(cmd => cmd.Status)
            .NotEmpty()
            .IsInEnum();
    }
}