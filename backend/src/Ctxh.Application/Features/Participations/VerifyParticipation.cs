using Ctxh.Application.Abstractions;
using Ctxh.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Participations;

public sealed record VerifyParticipationCommand(int ParticipationId, bool Approve);

public sealed class VerifyParticipationHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    TimeProvider timeProvider)
{
    public async Task HandleAsync(VerifyParticipationCommand command, CancellationToken ct = default)
    {
        var participation = await db.Participations
            .FirstOrDefaultAsync(p => p.Id == command.ParticipationId, ct)
            ?? throw NotFoundException.For("Lượt tham gia", command.ParticipationId);

        participation.Verify(
            currentUser.GetRequiredUserId(),
            command.Approve,
            timeProvider.GetUtcNow().UtcDateTime);

        await db.SaveChangesAsync(ct);
    }
}
