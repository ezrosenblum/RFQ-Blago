namespace DTO.User;

public record UserInfoResponse : UserResponse
{
    public string Type { get; set; } = null!;
}
