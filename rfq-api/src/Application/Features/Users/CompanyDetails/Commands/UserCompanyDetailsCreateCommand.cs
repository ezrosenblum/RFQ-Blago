using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Features.Users.Validators;
using Domain.Entities.Users.CompanyDetails;
using DTO.Enums.Company;
using FluentValidation;
using Microsoft.AspNetCore.Http;


public sealed record UserCompanyDetailsCreateCommand(
    string Name,
    string? ContactPersonFirstName,
    string? ContactPersonLastName,
    string? ContactPersonEmail,
    string? ContactPersonPhone,
    string? Description,
    string? StreetAddress,
    double? LatitudeAddress,
    double? LongitudeAddress,
    double? OperatingRadius,
    CompanySize CompanySize,
    IFormFile? Certificate) : ICommand<UserCompanyDetails>, IUserCompanyDetailsInsertData;

public sealed class UserCompanyDetailsCreateCommandHandler : ICommandHandler<UserCompanyDetailsCreateCommand, UserCompanyDetails>
{
    public async Task<UserCompanyDetails> Handle(UserCompanyDetailsCreateCommand command, CancellationToken cancellationToken)
    {
        var company = UserCompanyDetails.Create(
            command,
            command.Certificate);

        return company;
    }
}

public sealed class UserCompanyDetailsCreateCommandValidator : AbstractValidator<UserCompanyDetailsCreateCommand>
{
    public UserCompanyDetailsCreateCommandValidator(UserEmailUniqueValidator emailUniqueValidator)
    {
        RuleFor(cmd => cmd.Name)
            .NotEmpty();
    }
}
