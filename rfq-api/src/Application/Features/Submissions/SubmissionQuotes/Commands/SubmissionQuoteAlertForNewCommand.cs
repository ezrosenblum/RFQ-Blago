using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.MessageBroker;
using Application.Features.Notifications.Commands;
using AutoMapper;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Entities.User;
using DTO.Enums.Notification;
using DTO.MessageBroker.Messages.Submission;
using DTO.MessageBroker.Messages.Submission.SubmissionQuote;
using DTO.Notification;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteAlertForNewCommand(int SubmissionQuoteId) : ICommand;

public sealed record SubmissionQuoteAlertForNewCommandHandler : ICommandHandler<SubmissionQuoteAlertForNewCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;
    private readonly IMessagePublisher _messagePublisher;

    public SubmissionQuoteAlertForNewCommandHandler(
        IApplicationDbContext dbContext,
        ISender mediatr,
        IMapper mapper,
        IMessagePublisher messagePublisher)
    {
        _dbContext = dbContext;
        _mediatr = mediatr;
        _mapper = mapper;
        _messagePublisher = messagePublisher;
    }

    public async Task Handle(SubmissionQuoteAlertForNewCommand command, CancellationToken cancellationToken)
    {
        var quote = await _dbContext.SubmissionQuote
            .Include(s => s.Submission)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == command.SubmissionQuoteId, cancellationToken);

        if (quote == null)
            return;

        if (quote.Submission.User.ReceivePushNotifications)
            await SendPushNotification(quote, cancellationToken);

        if (quote.Submission.User.ReceiveEmailNotifications)
            await SendEmailNotification(quote.Id, quote.Submission.User, cancellationToken);

    }

    private async Task SendPushNotification(SubmissionQuote quote, CancellationToken cancellationToken)
    {
        var mappedData = _mapper.Map<NewSubmissionQuoteData>(quote);

        var data = JsonSerializer.Serialize(mappedData);

        await _mediatr.Send(new NotificationCreateCommand(
            quote.Submission.UserId,
            "New Quote on your RFQ",
            "There was a new quote added on your RFQ. Check it out.",
            data,
            NotificationType.NewQuote),
            cancellationToken);
    }
    private async Task SendEmailNotification(int quoteId, ApplicationUser user, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(
            new SubmissionQuoteAlertForNewMessage(
                quoteId,
                user.FirstName,
                user.LastName,
                user.Email!), cancellationToken);
    }
}