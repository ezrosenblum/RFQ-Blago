using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Validators;
using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Domain.Interfaces;
using DTO.Enums.Submission.SubmissionQuote.QuoteMessage;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageMarkAsSeenCommand(int QuoteMessageId) : ICommand;

public sealed record QuoteMessageMarkAsSeenCommandHandler : ICommandHandler<QuoteMessageMarkAsSeenCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IApplicationDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTime _dateTime;

    public QuoteMessageMarkAsSeenCommandHandler(
        IUnitOfWork unitOfWork,
        IApplicationDbContext dbContext,
        ICurrentUserService currentUserService,
        IDateTime dateTime)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
    }

    public async Task Handle(QuoteMessageMarkAsSeenCommand command, CancellationToken cancellationToken)
    {
        var quoteMessage = await _dbContext.QuoteMessage
            .Where(s => s.Id == command.QuoteMessageId &&
                        s.QuoteMessageStatus != QuoteMessageStatus.Seen)
            .Include(s => s.SubmissionQuote)
            .ThenInclude(s => s.Submission)
            .Where(s => (s.SubmissionQuote.VendorId == _currentUserService.UserId ||
                        s.SubmissionQuote.Submission.UserId == _currentUserService.UserId) &&
                        s.SenderId != _currentUserService.UserId)
            .FirstOrDefaultAsync();

        if (quoteMessage != null)
        {
            quoteMessage.MarkAsSeen();

            _dbContext.QuoteMessage.Update(quoteMessage);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}

public sealed class QuoteMessageMarkAsSeenCommandValidator : AbstractValidator<QuoteMessageMarkAsSeenCommand>
{
    public QuoteMessageMarkAsSeenCommandValidator(
        IRepository<QuoteMessage> quoteMessageRepository,
        ILocalizationService localizationService)
    {
        RuleFor(x => x.QuoteMessageId)
            .NotNull()
            .NotEmpty()
            .DependentRules(
                  () =>
                  {
                      RuleFor(x => new EntityExistsValidatorData(x.QuoteMessageId))
                        .SetValidator(new EntityExistsValidator<QuoteMessage>(quoteMessageRepository, localizationService))
                        .OverridePropertyName(nameof(QuoteMessageMarkAsSeenCommand.QuoteMessageId));
                  });
    }
}