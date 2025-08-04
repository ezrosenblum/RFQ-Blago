using Domain.Entities.Submissions.SubmissionQuotes;
using Infrastructure.Common.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.EntityConfigurations;

public class SubmissionQuoteConfiguration : IEntityTypeConfiguration<SubmissionQuote>
{
    public void Configure(EntityTypeBuilder<SubmissionQuote> builder)
    {
        builder.Property(e => e.Media)
            .HasConversion<MediaToDbJsonConverter>();
    }
}

