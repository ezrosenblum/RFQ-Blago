using Application.Common.Interfaces;
using Application.Common.Interfaces.Identity;
using Application.Common.Services;
using Application.Identity;
using Infrastructure.Identity;
using static Persistence.ApplicationDbContextInitialiser;

namespace Infrastructure.Services;

public class IdentityImpersonator : IIdentityImpersonator
{
    private readonly IApplicationUserManager _applicationUserManager;
    private readonly IIdentityContextAccessor _identityContextAccessor;
    private readonly IUnitOfWork _unitOfWork;

    public IdentityImpersonator(
        IApplicationUserManager applicationUserManager,
        IIdentityContextAccessor identityContextAccessor,
        IUnitOfWork unitOfWork)
    {
        _applicationUserManager = applicationUserManager;
        _identityContextAccessor = identityContextAccessor;
        _unitOfWork = unitOfWork;
    }

    public async Task ImpersonateAsync(string email, Func<Task> action, CancellationToken cancellationToken)
    {
        var admin = await _applicationUserManager.GetByEmailAsync(email);
        if (admin == null) throw new Exception("Admin user not found");

        _identityContextAccessor.IdentityContext = new IdentityContextCustom(new DefaultUserInfo(admin));

        try
        {
            await action();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        finally
        {
            _identityContextAccessor.IdentityContext = null;
        }
    }
}
