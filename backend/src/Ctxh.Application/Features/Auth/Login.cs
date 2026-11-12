using Ctxh.Application.Abstractions;
using Ctxh.Domain.Exceptions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Auth;

public sealed record LoginCommand(string StudentCode, string Password);

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.StudentCode).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class LoginHandler(
    IAppDbContext db,
    IPasswordHasher passwordHasher,
    IJwtService jwtService,
    IValidator<LoginCommand> validator)
{
    public async Task<AuthResponse> HandleAsync(LoginCommand command, CancellationToken ct = default)
    {
        await validator.ValidateAndThrowAsync(command, ct);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.StudentCode == command.StudentCode, ct)
            ?? throw new UnauthorizedException("Mã sinh viên hoặc mật khẩu không đúng");

        if (!passwordHasher.Verify(user.PasswordHash, command.Password))
            throw new UnauthorizedException("Mã sinh viên hoặc mật khẩu không đúng");

        var token = jwtService.Create(user);
        return new AuthResponse(token.AccessToken, token.ExpiresAt, UserDto.From(user));
    }
}
