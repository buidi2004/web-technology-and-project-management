using Ctxh.Application.Abstractions;
using Ctxh.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Activities;

public sealed class GetActivityHandler(IAppDbContext db)
{
    public async Task<ActivityDto> HandleAsync(int activityId, CancellationToken ct = default)
    {
        var activity = await db.Activities
            .AsNoTracking()
            .Where(a => a.Id == activityId)
            .Select(a => new ActivityDto(
                a.Id,
                a.Title,
                a.Type,
                a.Days,
                a.Location,
                a.StartAt,
                a.EndAt))
            .FirstOrDefaultAsync(ct)
            ?? throw NotFoundException.For("Hoạt động", activityId);

        return activity;
    }
}
