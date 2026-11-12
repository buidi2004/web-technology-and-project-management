using Ctxh.Application.Features.Auth;
using Ctxh.Application.Features.Me;
using Ctxh.Application.Features.Participations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ctxh.Api.Endpoints;

public static class MeEndpoints
{
    public static IEndpointRouteBuilder MapMeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/me")
            .WithTags("Me")
            .RequireAuthorization();

        group.MapGet("", async Task<Ok<UserDto>> (
                GetMeHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(await handler.HandleAsync(ct)))
            .WithName("GetMe")
            .Produces<UserDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapGet("/summary", async Task<Ok<MySummaryDto>> (
                GetMySummaryHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(await handler.HandleAsync(ct)))
            .WithName("GetMySummary")
            .Produces<MySummaryDto>();

        group.MapGet("/participations", async Task<Ok<IReadOnlyList<MyParticipationDto>>> (
                GetMyParticipationsHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(await handler.HandleAsync(ct)))
            .WithName("GetMyParticipations")
            .Produces<IReadOnlyList<MyParticipationDto>>();

        return app;
    }
}
