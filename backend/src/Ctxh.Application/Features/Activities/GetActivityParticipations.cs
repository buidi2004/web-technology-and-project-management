using Ctxh.Application.Abstractions;
using Ctxh.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Activities;

public sealed class GetActivityParticipationsHandler(IAppDbContext db)
{
    public async Task<IReadOnlyList<ActivityParticipationDto>> HandleAsync(
        int activityId,
        CancellationToken ct = default)
    {
        var exists = await db.Activities.AnyAsync(a => a.Id == activityId, ct);
        if (!exists)
            throw NotFoundException.For("Hoạt động", activityId);

        return await db.Participations
            .Where(p => p.ActivityId == activityId)
            .OrderBy(p => p.Student!.StudentCode)
            .Select(p => new ActivityParticipationDto(
                p.Id,
                p.StudentId,
                p.Student!.StudentCode,
                p.Student.FullName,
                p.Status,
                p.CheckedInAt))
            .ToListAsync(ct);
    }
}
