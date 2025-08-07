namespace Domain.Entities.Users;

public interface IUserUpdateNotificationPreferencesData
{
    bool ReceiveEmailNotifications { get; }
    bool ReceivePushNotifications { get; }
}
