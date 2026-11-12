using System.Security.Claims;
using Ctxh.Application.Abstractions;
using Ctxh.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace Ctxh.Infrastructure.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? Principal => httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

    public int? UserId =>
        int.TryParse(Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

    public string? StudentCode => Principal?.FindFirst(ClaimTypes.Name)?.Value;

    public Role? Role =>
        Enum.TryParse<Role>(Principal?.FindFirst(ClaimTypes.Role)?.Value, out var role) ? role : null;

    public int GetRequiredUserId() =>
        UserId ?? throw new UnauthorizedAccessException("Bạn cần đăng nhập để thực hiện thao tác này");
}
