using DTO.Enums.Company;
using Microsoft.AspNetCore.Http;

namespace Domain.Entities.Users.CompanyDetails;

public interface IUserCompanyDetailsUpdateData : IUserCompanyDetailsBaseData
{
    IFormFile? Certificate { get; }
}
