using Domain.Entities.Languages;
using Domain.Entities.Notifications;
using Domain.Entities.RefreshTokens;
using Domain.Entities.Submissions;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Entities.User;
using Domain.Entities.Users.CompanyDetails;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity)
        where TEntity : class;
    DbSet<ApplicationUser> User { get; }
    DbSet<Notification> Notification { get; }
    DbSet<RefreshToken> RefreshToken { get; }
    DbSet<Language> Language { get; }
    DbSet<Submission> Submission { get; }
    DbSet<SubmissionQuote> SubmissionQuote { get; }
    DbSet<UserCompanyDetails> UserCompanyDetails { get; }
}
