using Domain.Entities.Users.CompanyDetails;
using Microsoft.AspNetCore.Http;

namespace Domain.Events.Users.CompanyDetails;

public sealed class UserCompanyDetailsCreatedEvent : BaseEvent
{
    public UserCompanyDetailsCreatedEvent(UserCompanyDetails companyDetails, IFormFile? certificate)
    {
        CompanyDetails = companyDetails;
        Certificate = certificate;
    }

    public UserCompanyDetails CompanyDetails { get; }
    public IFormFile? Certificate { get; }
}
