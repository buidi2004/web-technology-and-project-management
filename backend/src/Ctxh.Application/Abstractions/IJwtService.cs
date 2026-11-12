using Ctxh.Domain.Entities;

namespace Ctxh.Application.Abstractions;

public sealed record JwtToken(string AccessToken, DateTime ExpiresAt);

public interface IJwtService
{
    JwtToken Create(User user);
}
