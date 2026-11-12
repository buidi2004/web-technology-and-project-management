using Ctxh.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Activities;

public sealed class GetActivitiesHandler(IAppDbContext db)
{
    public async Task<IReadOnlyList<ActivityDto>> HandleAsync(CancellationToken ct = default)
    {
        return await db.Activities
            .OrderByDescending(a => a.StartAt)
            .Select(a => new ActivityDto(
                a.Id,
                a.Title,
                a.Type,
                a.Days,
                a.Location,
                a.StartAt,
                a.EndAt))
            .ToListAsync(ct);
    }
}
