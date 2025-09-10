using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Interfaces;
using DTO.Enums.Submission;
using DTO.Enums.Submission.SubmissionQuote;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteCreateCommand(
    string Title,
    string Description,
    decimal Price,
    SubmissionQuotePriceType? PriceType,
    string? PriceTypeOther,
    GlobalIntervalType QuoteValidityIntervalType,
    int QuoteValidityInterval,
    string? TimelineDescription,
    int SubmissionId,
    int VendorId,
    IReadOnlyCollection<IFormFile>? Files) : ISubmissionQuoteInsertData, ICommand;

public sealed class SubmissionQuoteCreateCommandHandler : ICommandHandler<SubmissionQuoteCreateCommand>
{
    private readonly IRepository<SubmissionQuote> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _dbContext;
    private readonly IDateTime _dateTime;

    public SubmissionQuoteCreateCommandHandler(
        IRepository<SubmissionQuote> repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILocalizationService localizationService,
        IApplicationDbContext dbContext,
        IDateTime dateTime)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _dateTime = dateTime;
    }

    public async Task Handle(SubmissionQuoteCreateCommand command, CancellationToken cancellationToken)
    {
        SubmissionQuote newSubmissionQuote = SubmissionQuote.Create(command with { VendorId = _currentUserService.UserId!.Value }, command.Files);

        var submission = await _dbContext.Submission.FirstAsync(s => s.Id == command.SubmissionId, cancellationToken);

        if (!submission.StatusHistory.Any(s => s.VendorId == _currentUserService.UserId && s.Status == SubmissionStatusHistoryType.Quoted))
        {
            submission.CreateStatusHistory((int)_currentUserService.UserId, SubmissionStatusHistoryType.Quoted, _dateTime, true);
            _dbContext.Submission.Update(submission);
        }

        await _repository.AddAsync(newSubmissionQuote, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class SubmissionQuoteCreateCommandValidator : AbstractValidator<SubmissionQuoteCreateCommand>
{
    public SubmissionQuoteCreateCommandValidator(
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