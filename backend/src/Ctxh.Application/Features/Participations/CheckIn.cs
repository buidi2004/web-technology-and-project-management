using Ctxh.Application.Abstractions;
using Ctxh.Domain.Exceptions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Participations;

public sealed record CheckInCommand(int ActivityId, string Code);

public sealed class CheckInCommandValidator : AbstractValidator<CheckInCommand>
{
    public CheckInCommandValidator()
    {
        RuleFor(x => x.ActivityId).GreaterThan(0);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(128);
    }
}

public sealed class CheckInHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    TimeProvider timeProvider,
    IValidator<CheckInCommand> validator)
{
    public async Task HandleAsync(CheckInCommand command, CancellationToken ct = default)
    {
        await validator.ValidateAndThrowAsync(command, ct);

        var activity = await db.Activities
            .FirstOrDefaultAsync(a => a.Id == command.ActivityId, ct)
            ?? throw NotFoundException.For("Hoạt động", command.ActivityId);

        if (!string.Equals(activity.CheckInCode, command.Code, StringComparison.Ordinal))
            throw new BadRequestException("Mã QR không hợp lệ");

        var now = timeProvider.GetUtcNow().UtcDateTime;
        if (!activity.IsCheckInOpen(now))
            throw new BadRequestException("Ngoài thời gian điểm danh");

        var userId = currentUser.GetRequiredUserId();
        var participation = await db.Participations
            .FirstOrDefaultAsync(p => p.ActivityId == command.ActivityId && p.StudentId == userId, ct)
            ?? throw new BadRequestException("Bạn chưa đăng ký hoạt động này");

        participation.CheckIn(now);
        await db.SaveChangesAsync(ct);
    }
}
