using Application.Common.Interfaces;
using Domain.Entities.Categories;
using Domain.Entities.Languages;
using Domain.Entities.Notifications;
using Domain.Entities.RefreshTokens;
using Domain.Entities.Submissions;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Entities.User;
using Domain.Entities.Users.CompanyDetails;
using MediatR;
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
    public DbSet<SubmissionQuote> SubmissionQuote => Set<SubmissionQuote>();
    public DbSet<UserCompanyDetails> UserCompanyDetails => Set<UserCompanyDetails>();
    public DbSet<Category> Category => Set<Category>();
    public DbSet<Subcategory> Subcategory => Set<Subcategory>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(builder);
    }
}