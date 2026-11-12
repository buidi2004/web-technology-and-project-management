using Ctxh.Application.Abstractions;
using Ctxh.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Me;

public sealed record MySummaryDto(double CtxhDays, double LaoDongDays, int VerifiedActivities);

public sealed class GetMySummaryHandler(
    IAppDbContext db,
    ICurrentUserService currentUser)
{
    public async Task<MySummaryDto> HandleAsync(CancellationToken ct = default)
    {
        var userId = currentUser.GetRequiredUserId();

        var rows = await db.Participations
            .Where(p => p.StudentId == userId && p.Status == ParticipationStatus.Verified)
            .Select(p => new { p.Activity!.Type, p.Activity.Days })
            .ToListAsync(ct);

        return new MySummaryDto(
            rows.Where(r => r.Type == ActivityType.CongTacXaHoi).Sum(r => r.Days),
            rows.Where(r => r.Type == ActivityType.LaoDong).Sum(r => r.Days),
            rows.Count);
    }
}
