using Application.Common.Interfaces;
using Application.Identity;
using Domain.Entities.User;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IIdentityContextAccessor _identityContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        IIdentityContextAccessor identityContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
        _identityContextAccessor = identityContextAccessor;
    }

    public int? UserId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == "id");
            int id;

            if (claim != null)
            {
                if (int.TryParse(claim.Value, out id))
                {
                    return id;
                }
            }

            try
            {
                var currentUser = _identityContextAccessor.IdentityContext?.CurrentUser;

                if (currentUser != null)
                {
                    return currentUser.Id;
                }
            }
            catch (UnauthorizedAccessException)
            {
                return null;
            }

            return null;
        }
    }

    public string? UserRole
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.Claims.FirstOrDefault(c => c.Type == "userRole");

            if (claim != null)
            {
                return claim.Value;
            }

            try
            {
                var currentUser = _identityContextAccessor.IdentityContext?.CurrentUser;

                if (currentUser != null)
                {
                    return currentUser.Role;
                }
            }
            catch (UnauthorizedAccessException)
            {
                return null;
            }

            return null;
        }
    }
}
