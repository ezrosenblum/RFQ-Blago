using Application.Common.Interfaces;
using Application.Common.Localization.Extensions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Validators;

public sealed record UserPublicUsernameUniqueValidatorData(string? PublicUsername, int? UserId = null);
public sealed class UserPublicUsernameUniqueValidator : AbstractValidator<UserPublicUsernameUniqueValidatorData>
{
    public UserPublicUsernameUniqueValidator(IApplicationDbContext dbContext)
    {
        RuleFor(data => data)
            .Must(
                (data, _) =>
                {
                    var user = dbContext.User.FirstOrDefaultAsync(s => data.PublicUsername != null &&
                                                                       s.PublicUsername == data.PublicUsername).Result;
                    return user == null || user.Id == data.UserId;
                })
            .WithLocalizationKey("userPublicUsernameUniqueValidator.message");

    }
}
