using Ctxh.Application.Abstractions;
using Ctxh.Domain.Entities;
using Ctxh.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Infrastructure.Persistence;

public sealed class DbSeeder(AppDbContext db, IPasswordHasher passwordHasher)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(ct))
            return;

        var admin = CreateUser("admin", "Quản trị viên", Role.Admin, "Admin@123");
        var organizer = CreateUser("GV001", "Cán bộ Đoàn - Hội", Role.Organizer, "Org@12345");
        var student = CreateUser("SV001", "Nguyễn Văn A", Role.Student, "Sv@12345");

        db.Users.AddRange(admin, organizer, student);
        await db.SaveChangesAsync(ct);

        var now = DateTime.UtcNow;
        db.Activities.Add(new Activity
        {
            Title = "Mùa hè xanh - Dọn vệ sinh bờ sông",
            Type = ActivityType.CongTacXaHoi,
            Days = 1,
            Location = "Cao Lãnh",
            StartAt = now.AddHours(-1),
            EndAt = now.AddHours(4),
            CheckInCode = "demo-ctxh-2026",
            CreatedById = organizer.Id
        });

        await db.SaveChangesAsync(ct);
    }

    private User CreateUser(string code, string name, Role role, string password) => new()
    {
        StudentCode = code,
        FullName = name,
        Role = role,
        PasswordHash = passwordHasher.Hash(password)
    };
}
