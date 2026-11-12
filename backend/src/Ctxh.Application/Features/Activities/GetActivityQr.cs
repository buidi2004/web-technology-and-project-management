using Ctxh.Application.Abstractions;
using Ctxh.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Activities;

public sealed class GetActivityQrHandler(IAppDbContext db)
{
    public async Task<string> HandleAsync(int activityId, CancellationToken ct = default)
    {
        var activity = await db.Activities
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == activityId, ct)
            ?? throw NotFoundException.For("Hoạt động", activityId);

        return activity.BuildQrPayload();
    }
}
