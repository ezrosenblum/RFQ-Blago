using Microsoft.AspNetCore.Http;

namespace DTO.User.CompanyDetails;

public record UserCompanyDetailsUpdateRequest
{
    public string Name { get; init; } = null!;
    public string? ContactPersonFirstName { get; init; }
    public string? ContactPersonLastName { get; init; }
    public string? ContactPersonEmail { get; init; }
    public string? ContactPersonPhone { get; init; }
    public string? Description { get; init; }
    public string? StreetAddress { get; init; }
    public double? LatitudeAddress { get; init; }
    public double? LongitudeAddress { get; init; }
    public double? OperatingRadius { get; init; }
    public int CompanySize { get; init; }
    public IFormFile? Certificate { get; init; }
}
