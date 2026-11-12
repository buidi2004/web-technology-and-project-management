using Ctxh.Domain.Enums;

namespace Ctxh.Application.Features.Activities;

public sealed record ActivityDto(
    int Id,
    string Title,
    ActivityType Type,
    double Days,
    string Location,
    DateTime StartAt,
    DateTime EndAt);

public sealed record ActivityCreatedDto(int Id, string Qr);

public sealed record ActivityParticipationDto(
    int Id,
    int StudentId,
    string StudentCode,
    string FullName,
    ParticipationStatus Status,
    DateTime? CheckedInAt);
