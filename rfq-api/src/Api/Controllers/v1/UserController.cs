using Application.Features.Enums.Queries;
using Application.Features.Users.Commands;
using Application.Features.Users.CompanyDetails.Commands;
using Application.Features.Users.Queries;
using AutoMapper;
using DTO.Enums.Company;
using DTO.Enums.User;
using DTO.Medias;
using DTO.Response;
using DTO.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

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

    [AllowAnonymous]
    [HttpPost("company/details")]
    public async Task<IActionResult> CreateUserCompanyDetails([FromForm] UserCompanyDetailsCreateCommand request)
    {
        await Mediator.Send(request);
        return Ok();
    }

    [HttpPut]
    public async Task<UserResponse> Update([FromForm] UserUpdateRequest request)
    {
        return await Mediator.Send(_mapper.Map<UserUpdateCommand>(request));
    }

    [HttpPut("{customerId}")]
    public async Task<IActionResult> Update([FromRoute] int customerId, [FromBody] UpdateCustomerRequest request)
    {
        await Mediator.Send(new UpdateCustomerCommand(customerId, request.FirstName, request.LastName, request.PhoneNumber));
        return Ok();
    }

    [HttpPut("notification/preferences")]
    public async Task<IActionResult> UpdateNotificationPreferences([FromBody] UserUpdateNotificationPreferencesCommand request)
    {
        await Mediator.Send(request);
        return Ok();
    }

    [HttpGet("{id:int}")]
    public async Task<UserInfoResponse> Get(int id)
    {
        var response = await Mediator.Send(new UserGetQuery(id));
        return response;
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

    [HttpPut("categories")]
    public async Task<IActionResult> UpdateCategories([FromBody] UserUpdateCategoriesCommand command)
    {
        await Mediator.Send(command);
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

    [AllowAnonymous]
    [HttpGet("company/size")]
    public async Task<IReadOnlyCollection<ListItemBaseResponse>> GetCompanySizes()
    {
        return await Mediator.Send(new GetEnumValuesQuery(typeof(CompanySize)));
    }
}
