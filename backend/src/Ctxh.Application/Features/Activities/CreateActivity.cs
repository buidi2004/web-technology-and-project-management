using Ctxh.Application.Abstractions;
using Ctxh.Application.Common;
using Ctxh.Domain.Entities;
using Ctxh.Domain.Enums;
using FluentValidation;

namespace Ctxh.Application.Features.Activities;

public sealed record CreateActivityCommand(
    string Title,
    ActivityType Type,
    double Days,
    string Location,
    DateTime StartAt,
    DateTime EndAt);

public sealed class CreateActivityCommandValidator : AbstractValidator<CreateActivityCommand>
{
    public CreateActivityCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Days).GreaterThan(0).WithMessage("Số ngày phải lớn hơn 0");
        RuleFor(x => x.Location).NotEmpty().MaximumLength(256);
        RuleFor(x => x.StartAt).NotEmpty();
        RuleFor(x => x.EndAt)
            .NotEmpty()
            .GreaterThan(x => x.StartAt).WithMessage("Thời gian kết thúc phải sau thời gian bắt đầu");
    }
}

public sealed class CreateActivityHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    IValidator<CreateActivityCommand> validator)
{
    public async Task<ActivityCreatedDto> HandleAsync(
        CreateActivityCommand command,
        CancellationToken ct = default)
    {
        await validator.ValidateAndThrowAsync(command, ct);

        var activity = new Activity
        {
            Title = command.Title.Trim(),
            Type = command.Type,
            Days = command.Days,
            Location = command.Location.Trim(),
            StartAt = command.StartAt.ToUtc(),
            EndAt = command.EndAt.ToUtc(),
            CreatedById = currentUser.GetRequiredUserId()
        };

        db.Activities.Add(activity);
        await db.SaveChangesAsync(ct);

        return new ActivityCreatedDto(activity.Id, activity.BuildQrPayload());
    }
}
