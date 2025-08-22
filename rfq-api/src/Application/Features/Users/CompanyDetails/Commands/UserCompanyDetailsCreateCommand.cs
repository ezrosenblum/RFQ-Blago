using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Application.Common.Localization.Extensions;
using Application.Common.Services;
using Application.Features.Users.Validators;
using Domain.Entities.Users.CompanyDetails;
using DTO.Enums.Company;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

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
    IFormFile? Certificate,
    IReadOnlyCollection<int> CategoriesIds,
    IReadOnlyCollection<int> SubcategoriesIds) : ICommand<UserCompanyDetails>, IUserCompanyDetailsInsertData;

public sealed class UserCompanyDetailsCreateCommandHandler : ICommandHandler<UserCompanyDetailsCreateCommand, UserCompanyDetails>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIdentityImpersonator _identityImpersonator;
    private readonly ILocalizationService _localizationService;

    public UserCompanyDetailsCreateCommandHandler(
        IApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        IIdentityImpersonator identityImpersonator,
        ILocalizationService localizationService)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _identityImpersonator = identityImpersonator;
        _localizationService = localizationService;
    }

    public async Task<UserCompanyDetails> Handle(UserCompanyDetailsCreateCommand command, CancellationToken cancellationToken)
    {
        var user = await _dbContext.User
            .Include(u => u.Categories)
            .Include(u => u.Subcategories)
            .FirstOrDefaultAsync(u =>
                u.Id == command.UserId,
                cancellationToken);

        if (user == null)
            throw new NotFoundException(_localizationService.GetValue("user.notFound.error.message"));

        var company = UserCompanyDetails.Create(
            command,
            command.Certificate);

        var categories = await _dbContext.Category
            .Where(c => command.CategoriesIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        var subcategories = await _dbContext.Subcategory
            .Where(s => command.SubcategoriesIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        user.SetCategories(categories, subcategories);

        _dbContext.User.Update(user);
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

        RuleFor(cmd => cmd.CategoriesIds)
            .Must(c => c == null || c.Count <= 5);
    }
}
