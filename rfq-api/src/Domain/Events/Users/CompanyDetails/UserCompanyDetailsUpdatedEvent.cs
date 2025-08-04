using Domain.Entities.Users.CompanyDetails;

namespace Domain.Events.Users.CompanyDetails;

public sealed class UserCompanyDetailsUpdatedEvent : BaseEvent
{
    public UserCompanyDetailsUpdatedEvent(UserCompanyDetails companyDetails)
    {
        CompanyDetails = companyDetails;
    }

    public UserCompanyDetails CompanyDetails { get; }
}
