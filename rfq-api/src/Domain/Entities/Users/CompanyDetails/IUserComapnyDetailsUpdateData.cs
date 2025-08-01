using Microsoft.AspNetCore.Http;

namespace Domain.Entities.Users.CompanyDetails;

public interface IUserComapnyDetailsUpdateData : IUserCompanyDetailsInsertData
{
    IFormFile? Certificate { get; }
}
