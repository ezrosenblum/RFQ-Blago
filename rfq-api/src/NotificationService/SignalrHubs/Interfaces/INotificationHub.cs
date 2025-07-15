namespace NotificationService.SignalrHubs.Interfaces
{
    public interface INotificationHub
    {
        Task SuspendedUserAlert();
        Task SendTestNotification(string notificationText);
    }
}
