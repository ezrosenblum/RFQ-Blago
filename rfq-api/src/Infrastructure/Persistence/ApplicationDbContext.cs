using Application.Common.Interfaces;
using Domain.Entities.Languages;
using Domain.Entities.Notifications;
using Domain.Entities.RefreshTokens;
using Domain.Entities.Submissions;
using Domain.Entities.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Reflection;

namespace Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public override EntityEntry<TEntity> Entry<TEntity>(TEntity entity)
        where TEntity : class => base.Entry(entity);
    public DbSet<ApplicationUser> User => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshToken => Set<RefreshToken>();
    public DbSet<Notification> Notification => Set<Notification>();
    public DbSet<Language> Language => Set<Language>();
    public DbSet<Submission> Submission => Set<Submission>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(builder);
    }
}