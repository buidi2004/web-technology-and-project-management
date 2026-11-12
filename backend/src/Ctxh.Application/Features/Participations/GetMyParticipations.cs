using Ctxh.Application.Abstractions;
using Ctxh.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Participations;

public sealed record MyParticipationDto(
    int Id,
    int ActivityId,
    string Title,
    ActivityType Type,
    double Days,
    string Location,
    DateTime StartAt,
    DateTime EndAt,
    ParticipationStatus Status,
    DateTime? CheckedInAt,
    DateTime? VerifiedAt);

public sealed class GetMyParticipationsHandler(
    IAppDbContext db,
    ICurrentUserService currentUser)
{
    public async Task<IReadOnlyList<MyParticipationDto>> HandleAsync(CancellationToken ct = default)
    {
        var userId = currentUser.GetRequiredUserId();

        return await db.Participations
            .Where(p => p.StudentId == userId)
            .OrderByDescending(p => p.Activity!.StartAt)
            .Select(p => new MyParticipationDto(
                p.Id,
                p.ActivityId,
                p.Activity!.Title,
                p.Activity.Type,
                p.Activity.Days,
                p.Activity.Location,
                p.Activity.StartAt,
                p.Activity.EndAt,
                p.Status,
                p.CheckedInAt,
                p.VerifiedAt))
            .ToListAsync(ct);
    }
}
