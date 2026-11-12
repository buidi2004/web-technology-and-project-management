using Ctxh.Domain.Entities;
using Ctxh.Domain.Enums;

namespace Ctxh.Application.Features.Auth;

public sealed record UserDto(int Id, string StudentCode, string FullName, Role Role)
{
    public static UserDto From(User user) =>
        new(user.Id, user.StudentCode, user.FullName, user.Role);
}

public sealed record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
