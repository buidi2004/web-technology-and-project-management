using Ctxh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ctxh.Infrastructure.Persistence.Configurations;

public sealed class ParticipationConfiguration : IEntityTypeConfiguration<Participation>
{
    public void Configure(EntityTypeBuilder<Participation> builder)
    {
        builder.ToTable("Participations");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.HasIndex(x => new { x.ActivityId, x.StudentId }).IsUnique();

        builder.HasOne(x => x.Activity)
            .WithMany(x => x.Participations)
            .HasForeignKey(x => x.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Student)
            .WithMany(x => x.Participations)
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.VerifiedBy)
            .WithMany(x => x.VerifiedParticipations)
            .HasForeignKey(x => x.VerifiedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
