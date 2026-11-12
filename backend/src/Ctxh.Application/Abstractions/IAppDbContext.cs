using Ctxh.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Abstractions;

/// <summary>
/// Cổng truy cập dữ liệu của tầng Application. Infrastructure cài đặt bằng EF Core.
/// </summary>
public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Activity> Activities { get; }
    DbSet<Participation> Participations { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
