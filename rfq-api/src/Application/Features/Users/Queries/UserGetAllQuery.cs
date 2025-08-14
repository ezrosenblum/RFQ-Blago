﻿using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.User;
using DTO.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Queries;

public sealed record UserGetAllQuery() : IQuery<IReadOnlyCollection<UserResponse>>;

public sealed class UserGetAllQueryHandler : IQueryHandler<UserGetAllQuery, IReadOnlyCollection<UserResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserGetAllQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<IReadOnlyCollection<UserResponse>> Handle(UserGetAllQuery request, CancellationToken cancellationToken)
    {
        var users = await _dbContext.User
            .AsNoTracking()
            .Where(user => user.Uid != Guid.Empty)
            .ToListAsync();

        var userResponses = new List<UserInfoResponse>();

        foreach (var user in users)
        {
            var userResponse = _mapper.Map<UserInfoResponse>(user);

            var roles = await _userManager.GetRolesAsync(user);

            if (roles.Any())
                userResponse.Type = roles.First();

            userResponses.Add(userResponse);
        }

        return userResponses;
    }
}