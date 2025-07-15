using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
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
            .FirstOrDefaultAsync(s => s.Id == command.Id, cancellationToken);

        if (submission == null)
            throw new NotFoundException(_localizationService.GetValue("submission.notFound.error.message"));

        submission.ChangeStatus(command.Status);

        _dbContext.Submission.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionStatusChangeCommandValidator : AbstractValidator<SubmissionStatusChangeCommand>
{
    public SubmissionStatusChangeCommandValidator()
    {
        RuleFor(cmd => cmd.Id)
            .NotEmpty();

        RuleFor(cmd => cmd.Status)
            .NotEmpty()
            .IsInEnum();
    }
}