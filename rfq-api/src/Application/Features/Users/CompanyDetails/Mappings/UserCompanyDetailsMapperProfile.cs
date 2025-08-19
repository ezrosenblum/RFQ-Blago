using Application.Features.Users.CompanyDetails.Commands;
using AutoMapper;
using Domain.Entities.Users.CompanyDetails;
using DTO.Enums.Company;
using DTO.User.CompanyDetails;

namespace Application.Features.Users.CompanyDetails.Mappings;

public sealed class UserCompanyDetailsMapperProfile : Profile
{
    public UserCompanyDetailsMapperProfile()
    {
        CreateMap<UserCompanyDetails, UserCompanyDetailsResponse>()
            .ForMember(d => d.Certificate, opt => opt.MapFrom(s => s.Media.Items.FirstOrDefault()));

        CreateMap<UserCompanyDetailsUpdateRequest, UserCompanyDetailsUpdateCommand>();

        CreateMap<UserCompanyDetailsUpdateRequest, UserCompanyDetailsCreateCommand>()
            .ConstructUsing(src => new UserCompanyDetailsCreateCommand(
                src.Name,
                default,
                src.ContactPersonFirstName,
                src.ContactPersonLastName,
                src.ContactPersonEmail,
                src.ContactPersonPhone,
                src.Description,
                src.StreetAddress,
                src.LatitudeAddress,
                src.LongitudeAddress,
                src.OperatingRadius,
                (CompanySize)src.CompanySize,
                src.Certificate));

        CreateMap<UserCompanyDetailsUpdateCommand, UserCompanyDetailsResponse>();
    }
}
