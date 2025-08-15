using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.MessageBroker;
using Application.Features.Notifications.Commands;
using AutoMapper;
using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Domain.Entities.User;
using DTO.Enums.Notification;
using DTO.MessageBroker.Messages.Submission.SubmissionQuote.QuoteMessage;
using DTO.Notification;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.QuoteMessages.QuoteMessageQuotes.QuoteMessages.Commands;

public sealed record QuoteMessageAlertForNewCommand(
    int QuoteMessageId) : ICommand;

public sealed record QuoteMessageAlertForNewCommandHandler : ICommandHandler<QuoteMessageAlertForNewCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;
    private readonly IMessagePublisher _messagePublisher;

    public QuoteMessageAlertForNewCommandHandler(
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

    public async Task Handle(QuoteMessageAlertForNewCommand command, CancellationToken cancellationToken)
    {
        var quoteMessage = await _dbContext.QuoteMessage
            .Include(s => s.SubmissionQuote)
                .ThenInclude(s => s.Vendor)
            .Include(s => s.SubmissionQuote)
                .ThenInclude(s => s.Submission)
                    .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == command.QuoteMessageId, cancellationToken);

        if (quoteMessage == null)
            return;

        await SendNotificationsToRelatedPerson(quoteMessage, cancellationToken);
    }

    private async Task SendNotificationsToRelatedPerson(QuoteMessage quoteMessage, CancellationToken cancellationToken)
    {
        if (quoteMessage.SenderId != quoteMessage.SubmissionQuote.VendorId)
        {
            if (quoteMessage.SubmissionQuote.Vendor.ReceivePushNotifications)
                await SendPushNotification(quoteMessage, quoteMessage.SubmissionQuote.VendorId, cancellationToken);

            if (quoteMessage.SubmissionQuote.Vendor.ReceiveEmailNotifications)
                await SendEmailNotification(quoteMessage, quoteMessage.SubmissionQuote.Vendor, cancellationToken);
        }

        if (quoteMessage.SenderId != quoteMessage.SubmissionQuote.Submission.UserId)
        {
            if (quoteMessage.SubmissionQuote.Submission.User.ReceivePushNotifications)
                await SendPushNotification(quoteMessage, quoteMessage.SubmissionQuote.Submission.UserId, cancellationToken);

            if (quoteMessage.SubmissionQuote.Submission.User.ReceiveEmailNotifications)
                await SendEmailNotification(quoteMessage, quoteMessage.SubmissionQuote.Submission.User, cancellationToken);
        }
    }

    private async Task SendPushNotification(QuoteMessage quoteMessage, int userId, CancellationToken cancellationToken)
    {
        var mappedData = _mapper.Map<NewQuoteMessageData>(quoteMessage);

        var data = JsonSerializer.Serialize(mappedData);

        await _mediatr.Send(new NotificationCreateCommand(
            userId,
            "You received a new message",
            "You've just received a new message. Check it out.",
            data,
            NotificationType.NewMessage),
            cancellationToken);
    }
    private async Task SendEmailNotification(QuoteMessage quoteMessage, ApplicationUser user, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(
            new QuoteMessageAlertForNewMessage(
                quoteMessage.SubmissionQuoteId,
                quoteMessage.Id,
                user.FirstName,
                user.LastName,
                user.Email!), cancellationToken);
    }
}