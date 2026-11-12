using Ctxh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ctxh.Infrastructure.Persistence.Configurations;

public sealed class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(256);
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(x => x.Days).IsRequired();
        builder.Property(x => x.Location).IsRequired().HasMaxLength(256);
        builder.Property(x => x.StartAt).IsRequired();
        builder.Property(x => x.EndAt).IsRequired();
        builder.Property(x => x.CheckInCode).IsRequired().HasMaxLength(64);
        builder.HasIndex(x => x.CheckInCode).IsUnique();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasOne(x => x.CreatedBy)
            .WithMany(x => x.CreatedActivities)
            .HasForeignKey(x => x.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
