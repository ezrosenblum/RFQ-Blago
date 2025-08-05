using Application.Features.Users.Commands;
using Application.Features.Users.CompanyDetails.Commands;
using Application.Features.Users.Search;
using AutoMapper;
using Domain.Entities.User;
using DTO.Enums.Company;
using DTO.User;

namespace Application.Features.Users.Mappings;

public sealed class UserMapperProfile : Profile
{
    public UserMapperProfile()
    {
        CreateMap<ApplicationUser, UserResponse>()
            .ForMember(d => d.DateCreated, opt => opt.MapFrom(s => s.Created))
            .ForMember(d => d.Picture, opt => opt.MapFrom(s => s.Media.GetMainImageUrl()));

        CreateMap<ApplicationUser, UserBaseResponse>()
            .ForMember(d => d.Picture, opt => opt.MapFrom(s => s.Media.GetMainImageUrl()));

        CreateMap<ApplicationUser, UserInfoResponse>()
            .ForMember(d => d.DateCreated, opt => opt.MapFrom(s => s.Created))
            .ForMember(d => d.Picture, opt => opt.MapFrom(s => s.Media.GetMainImageUrl()))
            .ForMember(d => d.Type, opt => opt.Ignore());

        CreateMap<ApplicationUser, MeResponse>()
            .ForMember(d => d.ProfilePicture, opt => opt.MapFrom(s => s.Media.GetMainImageUrl()))
            .ForMember(d => d.Picture, opt => opt.MapFrom(s => s.Media.GetMainImageUrl()))
            .ForMember(d => d.DateCreated, opt => opt.MapFrom(s => s.Created));

        CreateMap<UserResponse, UserSearchable>();

        CreateMap<UserInfoResponse, UserSearchable>();

        CreateMap<UserCreateCommand, UserCompanyDetailsCreateCommand>()
            .ConstructUsing(src => new UserCompanyDetailsCreateCommand(
                src.CompanyDetails!.Name!,
                src.CompanyDetails.UserId,
                src.CompanyDetails!.ContactPersonFirstName,
                src.CompanyDetails!.ContactPersonLastName,
                src.CompanyDetails!.ContactPersonEmail,
                src.CompanyDetails!.ContactPersonPhone,
                src.CompanyDetails!.Description,
                src.CompanyDetails!.StreetAddress,
                src.CompanyDetails!.LatitudeAddress,
                src.CompanyDetails!.LongitudeAddress,
                src.CompanyDetails!.OperatingRadius,
                (CompanySize?)src.CompanyDetails!.CompanySize,
                src.Certificate));

        CreateMap<UserUpdateRequest, UserUpdateCommand>()
            .ConstructUsing(src => new UserUpdateCommand(
                src.FirstName,
                src.LastName,
                src.Email,
                src.PhoneNumber,
                src.CompanyDetails));
    }
}
