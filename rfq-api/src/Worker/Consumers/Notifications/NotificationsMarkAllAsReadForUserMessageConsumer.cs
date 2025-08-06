using Application.Common.Interfaces.Repository.Base;
using Application.Common.Search;
using Application.Features.Notifications.Search;
using AutoMapper;
using Domain.Entities.Notifications;
using DTO.MessageBroker.Messages.Notification;
using MassTransit;

namespace Worker.Consumers.Notifications;

public sealed class NotificationsMarkAllAsReadForUserMessageConsumer : IConsumer<NotificationsMarkAllAsReadForUserMessage>
{
    private readonly IRepository<Notification> _repository;
    private readonly IMapper _mapper;
    private readonly ISearchClient<NotificationSearchable> _searchClient;
    private readonly ILogger<NotificationsMarkAllAsReadForUserMessageConsumer> _logger;
    public NotificationsMarkAllAsReadForUserMessageConsumer(
        IRepository<Notification> repository,
        IMapper mapper,
        ISearchClient<NotificationSearchable> searchClient,
        ILogger<NotificationsMarkAllAsReadForUserMessageConsumer> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _searchClient = searchClient;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<NotificationsMarkAllAsReadForUserMessage> context)
    {
        _logger.LogDebug($"Reindexing notifications with ids: {string.Join(", ", context.Message.NotificationIds)}");
        try
        {
            var notifications = await _repository.GetManyAsync(context.Message.NotificationIds);
            var notificationsSearchable = _mapper.Map<IReadOnlyCollection<NotificationSearchable>>(notifications);
            await _searchClient.IndexAndRefreshManyAsync(notificationsSearchable);
            _logger.LogDebug($"Reindexing for notifications with ids finished: {string.Join(", ", context.Message.NotificationIds)}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error while indexing the following notification ids: {string.Join(", ", context.Message.NotificationIds)}");
        }
    }
}
