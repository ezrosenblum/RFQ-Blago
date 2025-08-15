using DTO.Attributes;

namespace DTO.Enums.Notification;

public enum NotificationType
{
    [LocalizationKey("enum.notificationType.newRfq")]
    NewRFQ = 1,
    [LocalizationKey("enum.notificationType.newQuote")]
    NewQuote = 2,
    [LocalizationKey("enum.notificationType.newMessage")]
    NewMessage = 3,
}
