using Application.Common.MessageBroker;
using Domain.Entities.User;
using Domain.Events.Users;
using DTO.MessageBroker.Messages.Search;
using DTO.MessageBroker.Messages.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using System.Text;

namespace Application.Features.Users.EventHandlers;

public sealed class UserCreatedEventHandler : INotificationHandler<UserCreatedEvent>
{
    private readonly IMessagePublisher _messagePublisher;
    private readonly ILogger<UserCreatedEventHandler> _logger;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserCreatedEventHandler(
        IMessagePublisher messagePublisher,
        ILogger<UserCreatedEventHandler> logger,
        UserManager<ApplicationUser> userManager)
    {
        _messagePublisher = messagePublisher;
        _logger = logger;
        _userManager = userManager;
    }

    public async Task Handle(UserCreatedEvent eventData, CancellationToken cancellationToken)
    {
        _logger.LogInformation("User created {user}", eventData.User);

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(eventData.User);

        _logger.LogInformation("Generated Email Confirmation token.");

        eventData.User!.SetEmailVerificationToken(token);

        _logger.LogInformation("Set Email Confirmation token.");

        await _userManager.UpdateAsync(eventData.User);

        _logger.LogInformation("Updated user.");

        byte[] tokenBytes = Encoding.UTF8.GetBytes(token);

        _logger.LogInformation("Token Bytes generated.");

        var tokenEncoded = WebEncoders.Base64UrlEncode(tokenBytes);

        _logger.LogInformation("Token Bytes encoded.");

        await _messagePublisher.PublishAsync(new UserCreatedMessage
        {
            FirstName = eventData.User.FirstName,
            LastName = eventData.User.LastName,
            Email = eventData.User.Email!,
            EmailVerificationCode = tokenEncoded,
            Uid = eventData.User.Uid
        });

        _logger.LogInformation("Message created user sent.");

        await _messagePublisher.PublishAsync(new IndexUserMessage(eventData.User.Id));

        _logger.LogInformation("Message index user sent.");

    }
}
