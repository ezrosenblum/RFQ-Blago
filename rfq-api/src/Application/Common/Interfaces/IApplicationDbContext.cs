using Domain.Entities.Languages;
using Domain.Entities.Notifications;
using Domain.Entities.RefreshTokens;
using Domain.Entities.Submissions;
using Domain.Entities.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity)
        where TEntity : class;
    DbSet<ApplicationUser> User { get; }
    DbSet<RefreshToken> RefreshToken { get; }
    DbSet<Notification> Notification { get; }
    DbSet<Language> Language { get; }
    DbSet<Submission> Submission { get; }
}
