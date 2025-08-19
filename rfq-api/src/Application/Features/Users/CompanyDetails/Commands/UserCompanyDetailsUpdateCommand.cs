using Application.Common.Interfaces;
using Application.Common.Interfaces.Repository.Base;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.Users.CompanyDetails;
using Domain.Interfaces;
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
    CompanySize? CompanySize,
    IFormFile? Certificate) : ICommand<UserCompanyDetailsResponse>, IUserCompanyDetailsUpdateData;

public sealed class UserCompanyDetailsUpdateCommandHandler : ICommandHandler<UserCompanyDetailsUpdateCommand, UserCompanyDetailsResponse>
{
    private readonly IRepository<UserCompanyDetails> _repository;
    private readonly IMediaStorage _mediaStorage;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;

    public UserCompanyDetailsUpdateCommandHandler(
        IRepository<UserCompanyDetails> repository,
        IMediaStorage mediaStorage,
        IMapper mapper,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _mediaStorage = mediaStorage;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserCompanyDetailsResponse> Handle(UserCompanyDetailsUpdateCommand command, CancellationToken cancellationToken)
    {
        var companyDetails = await _repository.GetSafeAsync(command.Id, cancellationToken);

        await companyDetails.Update(command, _mediaStorage);

        _repository.Update(companyDetails);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
