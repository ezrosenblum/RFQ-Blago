using Application.Features.Authentication.Commands.Login;
using Application.Features.Authentication.Commands.ResendCode;
using Application.Features.Authentication.Commands.TokenRefresh;
using Application.Features.Authentication.Commands.VerifyEmail.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

public class AuthenticateController : ApiControllerBase
{   
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Authenticate([FromBody] LoginCommand request)
    {
        return Ok(await Mediator.Send(request));
    }
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenCommand request)
    {
        return Ok(await Mediator.Send(request));
    }
}
