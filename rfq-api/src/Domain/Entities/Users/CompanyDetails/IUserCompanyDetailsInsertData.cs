 using DTO.Enums.Company;

namespace Domain.Entities.Users.CompanyDetails;

public interface IUserCompanyDetailsInsertData : IUserCompanyDetailsBaseData
{
    int UserId { get; }
}
