using Ctxh.Domain.Common;
using Ctxh.Domain.Enums;

namespace Ctxh.Domain.Entities;

public class Activity : Entity
{
    public string Title { get; set; } = string.Empty;
    public ActivityType Type { get; set; }
    public double Days { get; set; }
    public string Location { get; set; } = string.Empty;

    /// <summary>Thời gian bắt đầu (UTC).</summary>
    public DateTime StartAt { get; set; }

    /// <summary>Thời gian kết thúc (UTC).</summary>
    public DateTime EndAt { get; set; }

    /// <summary>Mã bí mật nằm trong QR: ctxh:{ActivityId}:{CheckInCode}</summary>
    public string CheckInCode { get; set; } = Guid.NewGuid().ToString("N");

    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public ICollection<Participation> Participations { get; set; } = new List<Participation>();

    /// <summary>Được điểm danh từ 30 phút trước khi bắt đầu đến khi kết thúc.</summary>
    public bool IsCheckInOpen(DateTime utcNow) =>
        utcNow >= StartAt.AddMinutes(-30) && utcNow <= EndAt;

    public string BuildQrPayload() => $"ctxh:{Id}:{CheckInCode}";
}
