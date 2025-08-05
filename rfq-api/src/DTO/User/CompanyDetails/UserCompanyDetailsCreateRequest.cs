namespace DTO.User.CompanyDetails;

public sealed record UserCompanyDetailsCreateRequest
{
    public string? Name { get; init; }
    public int UserId { get; init; }
    public string? ContactPersonFirstName { get; init; }
    public string? ContactPersonLastName { get; init; }
    public string? ContactPersonEmail { get; init; }
    public string? ContactPersonPhone { get; init; }
    public string? Description { get; init; }
    public string? StreetAddress { get; init; }
    public double? LatitudeAddress { get; init; }
    public double? LongitudeAddress { get; init; }
    public double? OperatingRadius { get; init; }
    public int? CompanySize { get; init; }
}
