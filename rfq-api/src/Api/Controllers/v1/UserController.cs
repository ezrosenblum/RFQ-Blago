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


    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] PasswordChangeCommand request)
    {
        await Mediator.Send(request);
        return Ok();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand request)
    {
        await Mediator.Send(request);
        return Ok();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand request)
    {
        try
        {
            await Mediator.Send(request);
            return Ok();
        }
        catch (ApplicationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("profile-picture")]
    public async Task<MediaItemResponse> UpdateProfilePicture([FromForm] UserProfilePictureUpdateRequest request)
    {
        var response = await Mediator.Send(new UserProfilePictureUpdateCommand(request.Picture));
        return response;
    }

    [HttpPut("activate")]
    public async Task<IActionResult> Activate()
    {
        await Mediator.Send(new UserChangeStatusCommand(UserStatus.Active));
        return Ok();
    }

    [HttpPut("deactivate")]
    public async Task<IActionResult> Deactivate()
    {
        await Mediator.Send(new UserChangeStatusCommand(UserStatus.Deactivated));
        return Ok();
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("status")]
    public async Task<IReadOnlyCollection<ListItemBaseResponse>> GetStatuses()
    {
        return await Mediator.Send(new GetEnumValuesQuery(typeof(UserStatus)));
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("role/admin")]
    public async Task<IReadOnlyCollection<ListItemBaseResponse>> GetRolesForAdmin()
    {
        return await Mediator.Send(new UserGetRolesQuery(true));
    }

    [AllowAnonymous]
    [HttpGet("role")]
    public async Task<IReadOnlyCollection<ListItemBaseResponse>> GetRoles()
    {
        return await Mediator.Send(new UserGetRolesQuery(false));
    }
}
