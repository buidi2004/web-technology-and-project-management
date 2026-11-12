using Ctxh.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ctxh.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.StudentCode).IsRequired().HasMaxLength(32);
        builder.HasIndex(x => x.StudentCode).IsUnique();

        builder.Property(x => x.FullName).IsRequired().HasMaxLength(128);
        builder.Property(x => x.PasswordHash).IsRequired().HasMaxLength(256);
        builder.Property(x => x.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}
