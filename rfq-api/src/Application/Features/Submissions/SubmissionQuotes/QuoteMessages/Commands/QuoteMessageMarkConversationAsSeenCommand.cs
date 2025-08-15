using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Submission.SubmissionQuote.QuoteMessage;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageMarkConversationAsSeenCommand(int SubmissionQuoteId) : ICommand;

public sealed record QuoteMessageMarkConversationAsSeenCommandHandler : ICommandHandler<QuoteMessageMarkConversationAsSeenCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public QuoteMessageMarkConversationAsSeenCommandHandler(
        IUnitOfWork unitOfWork,
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(QuoteMessageMarkConversationAsSeenCommand command, CancellationToken cancellationToken)
    {
        var quoteMessages = await _dbContext.QuoteMessage
            .Where(s => s.SubmissionQuoteId == command.SubmissionQuoteId &&
                        s.QuoteMessageStatus != QuoteMessageStatus.Seen)
            .Include(s => s.SubmissionQuote)
            .ThenInclude(s => s.Submission)
            .Where(s => (s.SubmissionQuote.VendorId == _currentUserService.UserId ||
                        s.SubmissionQuote.Submission.UserId == _currentUserService.UserId) &&
                        s.SenderId != _currentUserService.UserId)
            .ToListAsync();

        foreach(var quoteMessage in quoteMessages)
        {
            quoteMessage.MarkAsSeen();

            _dbContext.QuoteMessage.Update(quoteMessage);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class QuoteMessageMarkConversationAsSeenCommandValidator : AbstractValidator<QuoteMessageMarkConversationAsSeenCommand>
{
    public QuoteMessageMarkConversationAsSeenCommandValidator(
        IRepository<SubmissionQuote> submissionQuoteRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.SubmissionQuoteId)
            .NotNull()
            .NotEmpty()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.SubmissionQuoteId))
                        .SetValidator(new EntityExistsValidator<SubmissionQuote>(submissionQuoteRepository, localizationService))
                        .OverridePropertyName(nameof(QuoteMessageMarkConversationAsSeenCommand.SubmissionQuoteId));
                  });
    }
}