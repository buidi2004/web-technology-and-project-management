using Ctxh.Application.Features.Auth;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ctxh.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Auth")
            .AllowAnonymous();

        group.MapPost("/register", async Task<Created<AuthResponse>> (
                RegisterCommand command,
                RegisterHandler handler,
                CancellationToken ct) =>
            {
                var result = await handler.HandleAsync(command, ct);
                return TypedResults.Created("/api/me", result);
            })
            .WithName("Register")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapPost("/login", async Task<Ok<AuthResponse>> (
                LoginCommand command,
                LoginHandler handler,
                CancellationToken ct) =>
            {
                var result = await handler.HandleAsync(command, ct);
                return TypedResults.Ok(result);
            })
            .WithName("Login")
            .Produces<AuthResponse>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        return app;
    }
}
