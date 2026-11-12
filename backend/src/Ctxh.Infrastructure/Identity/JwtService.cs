using System.Security.Claims;
using System.Text;
using Ctxh.Application.Abstractions;
using Ctxh.Application.Common.Options;
using Ctxh.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Ctxh.Infrastructure.Identity;

public sealed class JwtService(IOptions<JwtOptions> options, TimeProvider timeProvider) : IJwtService
{
    public JwtToken Create(User user)
    {
        var settings = options.Value;

        if (string.IsNullOrWhiteSpace(settings.Key) ||
            Encoding.UTF8.GetByteCount(settings.Key) < 32)
        {
            throw new InvalidOperationException(
                "Cấu hình Jwt:Key phải có ít nhất 32 byte (256-bit) để ký HMAC-SHA256.");
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var expiresAt = now.AddDays(settings.ExpiryDays);

        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = settings.Issuer,
            Audience = settings.Audience,
            NotBefore = now,
            Expires = expiresAt,
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.StudentCode),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("fullName", user.FullName)
            ]),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key)),
                SecurityAlgorithms.HmacSha256)
        });

        return new JwtToken(token, expiresAt);
    }
}
