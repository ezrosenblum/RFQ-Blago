using DTO.Response;

namespace DTO.User.CompanyDetails;

public sealed record UserCompanyDetailsResponse
{
    public int Id { get; init; }
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
    public ListItemBaseResponse CompanySize { get; init; } = new();
    public string? CertificateUrl { get; init; }
}
