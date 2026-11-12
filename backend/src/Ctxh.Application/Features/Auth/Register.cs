using Ctxh.Application.Abstractions;
using Ctxh.Domain.Entities;
using Ctxh.Domain.Enums;
using Ctxh.Domain.Exceptions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Application.Features.Auth;

public sealed record RegisterCommand(string StudentCode, string FullName, string Password);

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.StudentCode)
            .NotEmpty().WithMessage("Mã sinh viên không được để trống")
            .MaximumLength(32)
            .Matches("^[A-Za-z0-9_-]+$").WithMessage("Mã sinh viên chỉ gồm chữ, số, gạch dưới hoặc gạch ngang");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống")
            .MaximumLength(128);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Mật khẩu phải có ít nhất 8 ký tự")
            .MaximumLength(128);
    }
}

public sealed class RegisterHandler(
    IAppDbContext db,
    IPasswordHasher passwordHasher,
    IJwtService jwtService,
    IValidator<RegisterCommand> validator)
{
    public async Task<AuthResponse> HandleAsync(RegisterCommand command, CancellationToken ct = default)
    {
        await validator.ValidateAndThrowAsync(command, ct);

        var exists = await db.Users.AnyAsync(u => u.StudentCode == command.StudentCode, ct);
        if (exists)
            throw new ConflictException("Mã sinh viên đã được sử dụng");

        var user = new User
        {
            StudentCode = command.StudentCode,
            FullName = command.FullName,
            Role = Role.Student,
            PasswordHash = passwordHasher.Hash(command.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        var token = jwtService.Create(user);
        return new AuthResponse(token.AccessToken, token.ExpiresAt, UserDto.From(user));
    }
}
