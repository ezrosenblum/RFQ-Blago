using DTO.Response;
using DTO.User.CompanyDetails;

namespace DTO.User;

public record UserResponse : UserBaseResponse
{
    public string? PhoneNumber { get; init; }
    public string? SuspensionReason { get; init; }
    public string Email { get; init; } = null!;
    public bool ReceiveEmailNotifications { get; init; }
    public bool ReceivePushNotifications { get; init; }
    public DateTime DateCreated { get; init; }
    public ListItemBaseResponse Status { get; init; } = null!;
    public UserCompanyDetailsResponse? CompanyDetails { get; set; }
}

