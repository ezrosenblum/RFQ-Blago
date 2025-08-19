using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Features.Users.CompanyDetails.Commands;
using Application.Features.Users.Validators;
using AutoMapper;
using Domain.Entities.User;
using Domain.Entities.Users;
using DTO.Enums.Company;
using DTO.User;
using DTO.User.CompanyDetails;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Commands;

public sealed record UserUpdateCommand(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    UserCompanyDetailsUpdateRequest? CompanyDetails
    ) : IUserUpdateData, ICommand<UserResponse>;


public sealed class UserUpdateCommandHandler : ICommandHandler<UserUpdateCommand, UserResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILocalizationService _localizationService;
    private readonly ISender _mediatr;

    public UserUpdateCommandHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILocalizationService localizationService,
        ISender mediatr)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _localizationService = localizationService;
        _mediatr = mediatr;
    }

    public async Task<UserResponse> Handle(UserUpdateCommand command, CancellationToken cancellationToken)
    {
        var user = await _dbContext.User
            .Include(u => u.CompanyDetails)
            .FirstOrDefaultAsync(u => u.Id == (int)_currentUserService.UserId!);

        if (user == null)
            throw new NotFoundException(_localizationService.GetValue("user.notFound.error.message"));

        user.Update(command);

        UserCompanyDetailsUpdateCommand? companyCommand = null;

        _dbContext.User.Update(user);

        if (command.CompanyDetails is not null)
        {
            var details = command.CompanyDetails;

            if (user.CompanyDetails == null)
            {
                var createCompanyCommand = _mapper.Map<UserCompanyDetailsCreateCommand>(details);

                await _mediatr.Send(createCompanyCommand with { UserId = user.Id }, cancellationToken);
            }


            companyCommand = new UserCompanyDetailsUpdateCommand(
                Id: user.CompanyDetails!.Id,
                Name: details.Name,
                ContactPersonFirstName: details.ContactPersonFirstName,
                ContactPersonLastName: details.ContactPersonLastName,
                ContactPersonEmail: details.ContactPersonEmail,
                ContactPersonPhone: details.ContactPersonPhone,
                Description: details.Description,
                StreetAddress: details.StreetAddress,
                LatitudeAddress: details.LatitudeAddress,
                LongitudeAddress: details.LongitudeAddress,
                OperatingRadius: details.OperatingRadius,
                CompanySize: (CompanySize)details.CompanySize,
                Certificate: details.Certificate
            );

            await _mediatr.Send(companyCommand, cancellationToken);

        }

        else 
            await _unitOfWork.SaveChangesAsync();

        user = await _dbContext.User
                .Include(u => u.CompanyDetails)
                .FirstAsync(s => s.Id == user.Id, cancellationToken);

        var userResponse = _mapper.Map<UserResponse>(user);

        if (companyCommand is not null)
            userResponse.CompanyDetails = _mapper.Map<UserCompanyDetailsResponse>(user.CompanyDetails);

        return userResponse;
    }
}

public sealed class UserUpdateCommandValidator : AbstractValidator<UserUpdateCommand>
{
    public UserUpdateCommandValidator(
        UserEmailUniqueValidator emailUniqueValidator,
        ICurrentUserService currentUserService)
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
                    RuleFor(cmd => new UserEmailUniqueValidatorData(cmd.Email, currentUserService.UserId))
                        .SetValidator(emailUniqueValidator)
                        .OverridePropertyName(nameof(UserUpdateCommand.Email));
                });
    }
}
