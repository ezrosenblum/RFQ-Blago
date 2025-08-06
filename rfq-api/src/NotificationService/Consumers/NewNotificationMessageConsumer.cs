using AutoMapper;
using DTO.MessageBroker.Messages.Notification;
using DTO.Notification;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.SignalrHubs.Implementations;
using NotificationService.SignalrHubs.Interfaces;

namespace NotificationService.Consumers;

public sealed class NewNotificationMessageConsumer : IConsumer<NewNotificationMessage>
{
    private readonly IHubContext<NotificationHub, INotificationHub> _notificationHub;
    private readonly IMapper _mapper;
    private readonly ILogger<NewNotificationMessageConsumer> _logger;

    public NewNotificationMessageConsumer(
        IHubContext<NotificationHub, INotificationHub> notificationHub,
        ILogger<NewNotificationMessageConsumer> logger,
        IMapper mapper)
    {
        _notificationHub = notificationHub;
        _mapper = mapper;
        _logger = logger;
    }
    public async Task Consume(ConsumeContext<NewNotificationMessage> context)
    {
        try
        {
            var notification = _mapper.Map<NewNotification>(context.Message);

            await _notificationHub.Clients.Group($"user_{context.Message.UserId.ToString()}").NewNotification(notification);

            _logger.LogInformation("New notification sent to user {UserId} with notification id {NotificationId}", 
                context.Message.UserId, context.Message.Id);
        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Error while sending new notification to user {UserId} with notification id {NotificationId}", 
                context.Message.UserId, context.Message.Id);
        }
    }
}