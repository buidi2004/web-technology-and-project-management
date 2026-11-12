using Ctxh.Application.Abstractions;
using Ctxh.Application.Features.Auth;
using Ctxh.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Me;

public sealed class GetMeHandler(
    IAppDbContext db,
    ICurrentUserService currentUser)
{
    public async Task<UserDto> HandleAsync(CancellationToken ct = default)
    {
        var userId = currentUser.GetRequiredUserId();

        var user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw NotFoundException.For("Người dùng", userId);

        return UserDto.From(user);
    }
}
