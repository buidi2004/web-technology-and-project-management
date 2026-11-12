namespace Ctxh.Domain.Common;

/// <summary>Base cho mọi entity: khóa chính tăng dần + thời điểm tạo (UTC).</summary>
public abstract class Entity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
