using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Interfaces;
using Application.Features.Users.Validators;
using Domain.Entities.User;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Application.Common.Interfaces.Request;

namespace Application.Features.Users.Commands;

public sealed record PasswordChangeCommand(string OldPassword, string NewPassword) : ICommand;

public sealed class ChangePasswordCommandHandler : ICommandHandler<PasswordChangeCommand>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ChangePasswordCommandHandler(
        ICurrentUserService currentUserService,
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _currentUserService = currentUserService;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
    }
    public async Task Handle(PasswordChangeCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUserService.UserId!.ToString()!);

        if (user == null)
            throw new UnauthorizedAccessException();

        var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            throw new ApplicationException("Password update failed");
        }

        // TODO: Store password change in database
        var oldPassword = _userManager.PasswordHasher.HashPassword(user, request.OldPassword);
        var ipAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();

        user.UpdatePassword(oldPassword, ipAddress);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public sealed class PasswordChangeCommandValidator : AbstractValidator<PasswordChangeCommand>
    {
        public PasswordChangeCommandValidator(
            ICurrentUserService currentUserService,
            CurrentPasswordValidator currentPasswordValidator,
            NewPasswordValidator newPasswordValidator)
        {
            RuleFor(cmd => cmd.OldPassword)
                .NotEmpty()
                .DependentRules(
                    () =>
                    {
                        RuleFor(cmd => new CurrentPasswordValidatorData(cmd.OldPassword, (int)currentUserService.UserId!))
                            .SetValidator(currentPasswordValidator)
                            .OverridePropertyName(nameof(PasswordChangeCommand.OldPassword))
                            .WithErrorCode("401")
                            .WithMessage("Invalid password");
                    });

            RuleFor(cmd => cmd.NewPassword)
                .NotEmpty()
                .DependentRules(
                    () =>
                    {
                        RuleFor(data => new NewPasswordValidatorData(data.NewPassword))
                            .SetValidator(newPasswordValidator)
                            .OverridePropertyName(nameof(PasswordChangeCommand.NewPassword));
                    });
        }
    }
}
