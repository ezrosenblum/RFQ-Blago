using Microsoft.AspNetCore.Http;

namespace Domain.Entities.Users.CompanyDetails;

public interface IUserCompanyDetailsUpdateData : IUserCompanyDetailsInsertData
{
    IFormFile? Certificate { get; }
}
