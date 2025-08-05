using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Users.Commands;

public sealed record UserUpdateCategoriesCommand(
    IReadOnlyCollection<int> CategoriesIds,
    IReadOnlyCollection<int> SubcategoriesIds) : ICommand;

public sealed class UserUpdateCategoriesCommandHandler : ICommandHandler<UserUpdateCategoriesCommand>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _dbContext;
    private readonly ILocalizationService _localizationService;
    private readonly IUnitOfWork _unitOfWork;
    public UserUpdateCategoriesCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext dbContext,
        ILocalizationService localizationService,
        IUnitOfWork unitOfWork)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _localizationService = localizationService;
        _unitOfWork = unitOfWork;
    }
    public async Task Handle(UserUpdateCategoriesCommand request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.User
            .Include(u => u.Categories)
            .Include(u => u.Subcategories)
            .FirstOrDefaultAsync(u => 
                u.Id == _currentUserService.UserId, 
                cancellationToken);

        if (user == null)
            throw new NotFoundException(_localizationService.GetValue("user.notFound.error.message"));

        var categories = await _dbContext.Category
            .Where(c => request.CategoriesIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        var subcategories = await _dbContext.Subcategory
            .Where(s => request.SubcategoriesIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        user.SetCategories(categories, subcategories);

        _dbContext.User.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
