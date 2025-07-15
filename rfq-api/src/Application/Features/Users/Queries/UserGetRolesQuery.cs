using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using DTO.Response;
using DTO.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Queries;

public sealed record UserGetRolesQuery(bool IsAdministrator) : IQuery<IReadOnlyCollection<ListItemBaseResponse>>;

public sealed class UserGetRolesQueryHandler : IQueryHandler<UserGetRolesQuery, IReadOnlyCollection<ListItemBaseResponse>>
{
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public UserGetRolesQueryHandler(
        RoleManager<IdentityRole<int>> roleManager)
    {
        _roleManager = roleManager;
    }
    public async Task<IReadOnlyCollection<ListItemBaseResponse>> Handle(UserGetRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = _roleManager.Roles;

        var roleListItems = await roles
            .Select(role => new ListItemBaseResponse
            {
                Id = role.Id,
                Name = role.Name
            })
            .ToListAsync(cancellationToken);

        if(!request.IsAdministrator)
        {
            roleListItems.Remove(roleListItems.FirstOrDefault(r => r.Name == UserRole.Administrator) ?? new ListItemBaseResponse());
        }

        return roleListItems;
    }
}
