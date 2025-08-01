using Domain.Entities.Base;
using Domain.Entities.Medias;
using Domain.Entities.Submissions;
using Domain.Entities.User;
using Domain.Events;
using Domain.Events.Submissions;
using Domain.Events.Users.CompanyDetails;
using Domain.Interfaces;
using DTO.Enums.Company;
using DTO.Enums.Media;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Entities.Users.CompanyDetails;

public class UserCompanyDetails : BaseAuditableEntity, IHasDomainEvents, IWithMedia
{
    public int UserId { get; private set; }
    public string Name { get; private set; } = null!;
    public string? ContactPersonFirstName { get; private set; }
    public string? ContactPersonLastName { get; private set; }
    public string? ContactPersonEmail { get; private set; }
    public string? ContactPersonPhone { get; private set; }
    public string? Description { get; private set; }
    public string? StreetAddress { get; private set; }
    public double? LongitudeAddress { get; private set; }
    public double? LatitudeAddress { get; private set; }
    public double? OperatingRadius { get; private set; }
    public CompanySize CompanySize { get; private set; }

    public Media Media { get; set; } = null!;

    public ApplicationUser User { get; private set; } = null!;

    private UserCompanyDetails() { }

    private UserCompanyDetails(
        IUserCompanyDetailsInsertData data)
    {
        Name = data.Name;
        ContactPersonFirstName = data.ContactPersonFirstName;
        ContactPersonLastName = data.ContactPersonLastName ?? string.Empty;
        ContactPersonEmail = data.ContactPersonEmail;
        ContactPersonPhone = data.ContactPersonPhone;
        Description = data.Description;
        CompanySize = data.CompanySize;
        StreetAddress = data.StreetAddress;
        LongitudeAddress = data.LongitudeAddress;
        LatitudeAddress = data.LatitudeAddress;
        OperatingRadius = data.OperatingRadius;

        Media = new Media(MediaEntityType.UserCompanyDetails);
    }
    public static UserCompanyDetails Create(IUserCompanyDetailsInsertData data,
                                            IFormFile? certificate)
    {
        var userCompanyDetails = new UserCompanyDetails(data);

        userCompanyDetails.AddDomainEvent(new UserCompanyDetailsCreatedEvent(userCompanyDetails, certificate));

        return userCompanyDetails;
    }

    public void Update(IUserComapnyDetailsUpdateData data)
    {
        Name = data.Name;
        ContactPersonFirstName = data.ContactPersonFirstName;
        ContactPersonLastName = data.ContactPersonLastName ?? string.Empty;
        ContactPersonEmail = data.ContactPersonEmail;
        ContactPersonPhone = data.ContactPersonPhone;
        Description = data.Description;
        CompanySize = data.CompanySize;
        StreetAddress = data.StreetAddress;
        LongitudeAddress = data.LongitudeAddress;
        LatitudeAddress = data.LatitudeAddress;
        OperatingRadius = data.OperatingRadius;

        AddDomainEvent(new UserCompanyDetailsUpdatedEvent(this));
    }

    public async Task UploadFile(IMediaUpsertData data, IMediaStorage mediaStorage)
    {
        await Media.Save(data, Id, mediaStorage);
    }

}
