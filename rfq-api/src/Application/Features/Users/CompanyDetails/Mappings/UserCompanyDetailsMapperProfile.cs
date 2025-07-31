using AutoMapper;
using Domain.Entities.Users.CompanyDetails;
using DTO.User.CompanyDetails;

namespace Application.Features.Users.CompanyDetails.Mappings;

public sealed class UserCompanyDetailsMapperProfile : Profile
{
    public UserCompanyDetailsMapperProfile()
    {
        CreateMap<UserCompanyDetails, UserCompanyDetailsResponse>()
            .ForMember(d => d.CertificateUrl, opt => opt.MapFrom(s => s.Media.GetMainImageUrl()));
    }
}
