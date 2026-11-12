using Ctxh.Domain.Enums;

namespace Ctxh.Application.Abstractions;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? StudentCode { get; }
    Role? Role { get; }
    bool IsAuthenticated { get; }

    /// <summary>Trả về user id hoặc ném UnauthorizedAccessException nếu chưa đăng nhập.</summary>
    int GetRequiredUserId();
}
