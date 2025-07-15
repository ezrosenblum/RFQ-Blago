using Application.Features.Enums.Queries;
using Application.Features.Users.Commands;
using Application.Features.Users.Queries;
using Application.Features.Users.Search;
using AutoMapper;
using DTO.Enums.User;
using DTO.Medias;
using DTO.Pagination;
using DTO.Response;
using DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

public class UserController : ApiControllerBase
{
    private readonly IMapper _mapper;

    public UserController(IMapper mapper)
    {
        _mapper = mapper;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<UserResponse> Create([FromBody] UserCreateCommand request)
    {
        return await Mediator.Send(request);
    }
    [HttpGet("me")]
    public async Task<MeResponse> GetUserInfo()
    {
        var response = await Mediator.Send(new UserGetCurrentDetailsQuery());
        return response;
    }
}
