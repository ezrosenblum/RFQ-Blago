using Application.Common.Interfaces.Identity;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Features.Users.Validators;
using AutoMapper;
using Domain.Entities.User;
using Domain.Interfaces;
using DTO.User;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Application.Features.Users.Commands;

public sealed record UserCreateCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? PhoneNumber,
    string Role) : ICommand<UserResponse>, IUserInsertData;

public sealed class UserCreateCommandHandler : ICommandHandler<UserCreateCommand, UserResponse>
{
    private readonly IDateTime _dateTimeProvider;
    private readonly IApplicationUserManager _applicationUserManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public UserCreateCommandHandler(
        IDateTime dateTimeProvider,
        IApplicationUserManager applicationUserManager,
        UserManager<ApplicationUser> userManager,
        IMapper mapper)
    {
        _dateTimeProvider = dateTimeProvider;
        _applicationUserManager = applicationUserManager;
        _userManager = userManager;
        _mapper = mapper;
    }
    public async Task<UserResponse> Handle(UserCreateCommand command, CancellationToken cancellationToken)
    {
        var user = ApplicationUser.Create(
            command,
            _dateTimeProvider);

        await _applicationUserManager.CreateAsync(user, command.Password);
        await _userManager.AddClaimAsync(user, new Claim("scope", "default"));
        await _userManager.AddToRoleAsync(user, command.Role);

        return _mapper.Map<UserResponse>(user);
    }
}

public sealed class UserCreateCommandValidator : AbstractValidator<UserCreateCommand>
{
    public UserCreateCommandValidator(UserEmailUniqueValidator emailUniqueValidator)
    {
        RuleFor(cmd => cmd.FirstName)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(cmd => cmd.LastName)
            .NotEmpty()
            .MaximumLength(30);

        RuleFor(cmd => cmd.PhoneNumber)
            .MaximumLength(15);

        RuleFor(cmd => cmd.Email)
            .NotEmpty()
            .EmailAddress()
            .DependentRules(
                () =>
                {
                    RuleFor(cmd => new UserEmailUniqueValidatorData(cmd.Email, null))
                        .SetValidator(emailUniqueValidator)
                        .OverridePropertyName(nameof(UserCreateCommand.Email));
                });
    }
}
