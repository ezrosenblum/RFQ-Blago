using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.Users.CompanyDetails;
using DTO.Enums.Company;
using DTO.User.CompanyDetails;
using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace Application.Features.Users.CompanyDetails.Commands;

public sealed record UserCompanyDetailsUpdateCommand(
    int Id,
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
    IFormFile? Certificate) : ICommand<UserCompanyDetailsResponse>, IUserCompanyDetailsUpdateData;

public sealed class UserCompanyDetailsUpdateCommandHandler : ICommandHandler<UserCompanyDetailsUpdateCommand, UserCompanyDetailsResponse>
{
    private readonly IRepository<UserCompanyDetails> _repository;
    private readonly IMapper _mapper;

    public UserCompanyDetailsUpdateCommandHandler(
        IRepository<UserCompanyDetails> repository,
        IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<UserCompanyDetailsResponse> Handle(UserCompanyDetailsUpdateCommand command, CancellationToken cancellationToken)
    {
        var companyDetails = await _repository.GetSafeAsync(command.Id, cancellationToken);

        companyDetails.Update(command);

        return _mapper.Map<UserCompanyDetailsResponse>(companyDetails);
    }
}

public sealed class UserCompanyDetailsUpdateCommandValidator : AbstractValidator<UserCompanyDetailsUpdateCommand>
{
    public UserCompanyDetailsUpdateCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty();

        RuleFor(x => x.ContactPersonEmail)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.ContactPersonEmail));

        RuleFor(x => x.OperatingRadius)
            .GreaterThan(0)
            .When(x => x.OperatingRadius.HasValue);
    }
}
