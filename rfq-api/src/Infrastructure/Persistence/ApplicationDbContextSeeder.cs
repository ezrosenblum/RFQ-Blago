using Application.Common.Interfaces;
using Application.Features.Languages.Commands;
using Domain.Entities.Medias;
using Domain.Entities.User;
using DTO.Enums.Media;
using DTO.Enums.User;
using DTO.User;
using MassTransit.Testing;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Persistence;

public static class ApplicationDbContextSeeder
{
    public static async Task<ApplicationUser> SeedDefaultRolesAndUsersAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<int>> roleManager)
    {
        var administratorRole = new IdentityRole<int>(UserRole.Administrator);
        var vendorRole = new IdentityRole<int>(UserRole.Vendor);
        var customerRole = new IdentityRole<int>(UserRole.Customer);

        // Create the default roles if not exsist
        if (roleManager.Roles.All(r => r.Name != administratorRole.Name)) await roleManager.CreateAsync(administratorRole);
        if (roleManager.Roles.All(r => r.Name != vendorRole.Name)) await roleManager.CreateAsync(vendorRole);
        if (roleManager.Roles.All(r => r.Name != customerRole.Name)) await roleManager.CreateAsync(customerRole);

        var administrator = new ApplicationUser
        {
            FirstName = "John",
            LastName = "Doe",
            UserName = "administrator@localhost",
            Email = "administrator@localhost",
            EmailConfirmed = true,
            Media = new Media(MediaEntityType.User),
            Status = UserStatus.Active
        };

        var customer = new ApplicationUser
        {
            FirstName = "Customer",
            LastName = "Smith",
            UserName = "client@demo.com",
            Email = "client@demo.com",
            EmailConfirmed = true,
            Media = new Media(MediaEntityType.User),
            Status = UserStatus.Active
        };

        var vendor = new ApplicationUser
        {
            FirstName = "Vendor",
            LastName = "Smith",
            UserName = "vendor@demo.com",
            Email = "vendor@demo.com",
            EmailConfirmed = true,
            Media = new Media(MediaEntityType.User),
            Status = UserStatus.Active
        };

        var existedCustomer = userManager.Users.FirstOrDefault(u => u.UserName == customer.UserName);
        if (existedCustomer == null)
        {
            await userManager.CreateAsync(customer, "Test12345!");
            await userManager.AddClaimAsync(customer, new Claim("scope", "default"));

            await userManager.AddToRolesAsync(
                customer,
                new[] { customerRole.Name! });
        }

        var existedVendor = userManager.Users.FirstOrDefault(u => u.UserName == vendor.UserName);
        if (existedVendor == null)
        {
            await userManager.CreateAsync(vendor, "Test12345!");
            await userManager.AddClaimAsync(vendor, new Claim("scope", "default"));

            await userManager.AddToRolesAsync(
                vendor,
                new[] { vendorRole.Name! });
        }

        var existedAdministrator = userManager.Users.FirstOrDefault(u => u.UserName == administrator.UserName);
        if (existedAdministrator == null)
        {
            await userManager.CreateAsync(administrator, "Administrator1!");
            await userManager.AddClaimAsync(administrator, new Claim("scope", "default"));

            await userManager.AddToRolesAsync(
                administrator,
                new[] { administratorRole.Name! });
        }

        return administrator;
    }

    public static async Task SeedDefaultLanguages(
        ISender mediatr,
        IApplicationDbContext dbContext)
    {
        if (!await dbContext.Language.AnyAsync())
        {
            await mediatr.Send(new LanguageCreateCommand("English", "en", "en-US", true));
        }
    }
}

