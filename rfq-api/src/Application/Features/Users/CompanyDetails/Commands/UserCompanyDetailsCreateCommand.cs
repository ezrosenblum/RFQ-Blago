using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.Localization.Extensions;
using Application.Common.Models;
using Application.Common.Services;
using Application.Features.Users.Validators;
using Domain.Entities.Users.CompanyDetails;
using DTO.Enums.Company;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace Application.Features.Users.CompanyDetails.Commands;

public sealed record UserCompanyDetailsCreateCommand(
    string Name,
    int UserId,
    string? ContactPersonFirstName,
    string? ContactPersonLastName,
    string? ContactPersonEmail,
    string? ContactPersonPhone,
    string? Description,
    string? StreetAddress,
    double? LatitudeAddress,
    double? LongitudeAddress,
    double? OperatingRadius,
    CompanySize? CompanySize,
    IFormFile? Certificate) : ICommand<UserCompanyDetails>, IUserCompanyDetailsInsertData;

public sealed class UserCompanyDetailsCreateCommandHandler : ICommandHandler<UserCompanyDetailsCreateCommand, UserCompanyDetails>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIdentityImpersonator _identityImpersonator;

    public UserCompanyDetailsCreateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IIdentityImpersonator identityImpersonator)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _identityImpersonator = identityImpersonator;
    }

    public async Task<UserCompanyDetails> Handle(UserCompanyDetailsCreateCommand command, CancellationToken cancellationToken)
    {
        var company = UserCompanyDetails.Create(
            command,
            command.Certificate);

        _dbContext.UserCompanyDetails.Add(company);
        await _identityImpersonator.ImpersonateAsync("administrator@localhost", async () =>
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        },
        cancellationToken);

        return company;
    }
}

public sealed class UserCompanyDetailsCreateCommandValidator : AbstractValidator<UserCompanyDetailsCreateCommand>
{
    public UserCompanyDetailsCreateCommandValidator(
        UserEmailUniqueValidator emailUniqueValidator,
        IApplicationDbContext dbContext)
    {
        RuleFor(cmd => cmd.Name)
            .NotEmpty();

        RuleFor(cmd => cmd.UserId)
            .MustAsync(async (UserId, cancellationToken) =>
            {
                var result = await dbContext.UserCompanyDetails.AnyAsync(s => s.UserId == UserId, cancellationToken);
                return !result;
            })
            .WithLocalizationKey("user.companyDetails.alreadyExists.message");

        RuleFor(cmd => cmd.UserId)
            .MustAsync(async (UserId, cancellationToken) =>
            {
                var result = await dbContext.User.AnyAsync(s => s.Id == UserId, cancellationToken);
                return result;
            })
            .WithLocalizationKey("user.notFound.error.message");

    }
}
