using Ctxh.Domain.Common;
using Ctxh.Domain.Enums;
using Ctxh.Domain.Exceptions;

namespace Ctxh.Domain.Entities;

public class Participation : Entity
{
    public int ActivityId { get; set; }
    public Activity? Activity { get; set; }

    public int StudentId { get; set; }
    public User? Student { get; set; }

    public ParticipationStatus Status { get; set; } = ParticipationStatus.Registered;
    public DateTime? CheckedInAt { get; set; }

    public int? VerifiedById { get; set; }
    public User? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }

    public void CheckIn(DateTime utcNow)
    {
        if (Status != ParticipationStatus.Registered)
            throw new ConflictException("Bạn đã điểm danh hoặc tham gia này đã được xử lý");

        Status = ParticipationStatus.CheckedIn;
        CheckedInAt = utcNow;
    }

    public void Verify(int verifierId, bool approve, DateTime utcNow)
    {
        if (Status != ParticipationStatus.CheckedIn)
            throw new ConflictException("Chỉ xác nhận được sinh viên đã điểm danh");

        Status = approve ? ParticipationStatus.Verified : ParticipationStatus.Rejected;
        VerifiedById = verifierId;
        VerifiedAt = utcNow;
    }
}
