using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using Infrastructure.Common.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.EntityConfigurations;

public class QuoteMessageConfiguration : IEntityTypeConfiguration<QuoteMessage>
{
    public void Configure(EntityTypeBuilder<QuoteMessage> builder)
    {
        builder.Property(e => e.Media)
            .HasConversion<MediaToDbJsonConverter>();
    }

}
