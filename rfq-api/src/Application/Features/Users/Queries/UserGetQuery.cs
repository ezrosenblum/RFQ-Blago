using Application.Common.Caching;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.User;
using DTO.User;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Queries;

public sealed record UserGetQuery(int UserId) : IQuery<UserInfoResponse>;

public sealed class UserGetQueryHandler : IQueryHandler<UserGetQuery, UserInfoResponse>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public UserGetQueryHandler(
        UserManager<ApplicationUser> userManager,
        IApplicationDbContext dbContext,
        IMapper mapper)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _mapper = mapper;
    }
    public async Task<UserInfoResponse> Handle(UserGetQuery query, CancellationToken cancellationToken)
    {
        var user = await _dbContext.User
            .Include(u => u.CompanyDetails)
            .FirstOrDefaultAsync(u => u.Id == query.UserId);


        var result = _mapper.Map<UserInfoResponse>(user!);

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Any())
            result.Type = roles.First();

        return result;
    }
}

public sealed class UserGetQueryValidator : AbstractValidator<UserGetQuery>
{
    public UserGetQueryValidator()
    {
        RuleFor(qry => qry.UserId)
            .NotEmpty();
    }
}
