using Application.Features.Users.Commands;
using Application.Features.Users.Search;
using AutoMapper;
using Domain.Entities.User;
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

        CreateMap<UserUpdateRequest, UserUpdateCommand>();

        CreateMap<UserResponse, UserSearchable>();

        CreateMap<UserInfoResponse, UserSearchable>();
    }
}
