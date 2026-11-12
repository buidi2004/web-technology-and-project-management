namespace Ctxh.Application.Common;

public static class DateTimeExtensions
{
    /// <summary>Chuẩn hóa thời gian client gửi lên về UTC.</summary>
    public static DateTime ToUtc(this DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
