using Application.Features.Notifications.Queries;
using Application.Features.Notifications.Search;
using AutoMapper;
using Domain.Entities.Notifications;
using DTO.MessageBroker.Messages.Notification;
using DTO.Notification;

namespace Application.Features.Notifications.Mappings;

public sealed class NotificationMapperProfile : Profile
{
    public NotificationMapperProfile()
    {
        CreateMap<NewNotificationMessage, NewNotification>()
            .ForMember(d => d.Id, opt => opt.MapFrom(s => s.NotificationId));

        CreateMap<Notification, NotificationResponse>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status));

        CreateMap<NotificationResponse, NotificationSearchable>();
        CreateMap<Notification, NotificationSearchable>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status));

        CreateMap<NotificationFullSearchForUserQuery, NotificationForUserFullSearchRequest>()
            .ForMember(d => d.UserId, opt => opt.Ignore());
    }
}