 using DTO.Enums.Company;

namespace Domain.Entities.Users.CompanyDetails;

public interface IUserCompanyDetailsInsertData
{
    string Name { get; }
    string? ContactPersonFirstName { get; }
    string? ContactPersonLastName { get; }
    string? ContactPersonEmail { get; }
    string? ContactPersonPhone { get; }
    string? Description { get; }
    string? StreetAddress { get; }
    double? LatitudeAddress { get; }
    double? LongitudeAddress { get; }
    double? OperatingRadius { get; }
    CompanySize? CompanySize { get; }
}
