using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.User;
using DTO.Enums.User;
using DTO.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Queries;

public sealed record UserGetByRoleQuery(string Role) : IQuery<IReadOnlyCollection<UserBaseResponse>>;

public sealed class UserGetByRoleQueryHandler : IQueryHandler<UserGetByRoleQuery, IReadOnlyCollection<UserBaseResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserGetByRoleQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<IReadOnlyCollection<UserBaseResponse>> Handle(UserGetByRoleQuery request, CancellationToken cancellationToken)
    {
        var users = await _dbContext.User
            .AsNoTracking()
            .Where(user => user.Status != UserStatus.AwaitingConfirmation)
            .ToListAsync();

        var userResponses = new List<UserBaseResponse>();

        foreach (var user in users)
        {
            var userResponse = _mapper.Map<UserBaseResponse>(user);

            var roles = await _userManager.GetRolesAsync(user);

            if (roles.Any() && roles.First() == request.Role)
                userResponses.Add(userResponse);
        }

        return userResponses;
    }
}
