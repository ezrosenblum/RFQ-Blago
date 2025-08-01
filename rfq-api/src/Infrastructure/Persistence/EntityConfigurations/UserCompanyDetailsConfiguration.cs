using Domain.Entities.Users.CompanyDetails;
using Infrastructure.Common.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.EntityConfigurations;

internal class UserCompanyDetailsConfiguration : IEntityTypeConfiguration<UserCompanyDetails>
{
    public void Configure(EntityTypeBuilder<UserCompanyDetails> builder)
    {
        builder.Property(e => e.Media)
            .HasConversion<MediaToDbJsonConverter>();
    }
}
