namespace Application.Common.Services;

public interface IIdentityImpersonator
{
    Task ImpersonateAsync(string email, Func<Task> action, CancellationToken cancellationToken);
}