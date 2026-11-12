using Ctxh.Application.Abstractions;
using Ctxh.Domain.Entities;
using Ctxh.Domain.Enums;
using Ctxh.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Participations;

public sealed record RegistrationResultDto(int Id, ParticipationStatus Status);

public sealed class RegisterForActivityHandler(
    IAppDbContext db,
    ICurrentUserService currentUser)
{
    public async Task<RegistrationResultDto> HandleAsync(int activityId, CancellationToken ct = default)
    {
        var activityExists = await db.Activities.AnyAsync(a => a.Id == activityId, ct);
        if (!activityExists)
            throw NotFoundException.For("Hoạt động", activityId);

        var userId = currentUser.GetRequiredUserId();
        var alreadyRegistered = await db.Participations
            .AnyAsync(p => p.ActivityId == activityId && p.StudentId == userId, ct);

        if (alreadyRegistered)
            throw new ConflictException("Bạn đã đăng ký hoạt động này");

        var participation = new Participation
        {
            ActivityId = activityId,
            StudentId = userId,
            Status = ParticipationStatus.Registered
        };

        db.Participations.Add(participation);
        await db.SaveChangesAsync(ct);

        return new RegistrationResultDto(participation.Id, participation.Status);
    }
}
