using Application.Common.Caching;
using Application.Features.Users.Commands;
using Domain.Events.Users;
using MediatR;

namespace Application.Features.Users.EventHandlers;

public sealed class UserUpdatedEventHandler : INotificationHandler<UserUpdatedEvent>
{
    private readonly IMediator _mediatr;

    public UserUpdatedEventHandler(
        IMediator mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Handle(UserUpdatedEvent notification, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new UserIndexCommand(notification.User.Id), cancellationToken);
    }
}
