using DTO.Response;

namespace DTO.Notification;

public record NewNotification
{
    public int Id { get; init; }
    public string Title { get; init; } = null!;
    public string? Description { get; init; }
    public ListItemBaseResponse Type { get; init; } = new();
    public ListItemBaseResponse Status { get; init; } = new();
    public DateTime DateSent { get; init; }
    public string Data { get; init; } = null!;
}