using Ctxh.Application.Features.Activities;
using Ctxh.Application.Features.Participations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ctxh.Api.Endpoints;

public sealed record CheckInRequest(string Code);

public static class ActivityEndpoints
{
    public static IEndpointRouteBuilder MapActivityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/activities")
            .WithTags("Activities")
            .RequireAuthorization();

        group.MapGet("", async Task<Ok<IReadOnlyList<ActivityDto>>> (
                GetActivitiesHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(await handler.HandleAsync(ct)))
            .WithName("GetActivities")
            .Produces<IReadOnlyList<ActivityDto>>();

        group.MapGet("/{id:int}", async Task<Ok<ActivityDto>> (
                int id,
                GetActivityHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(await handler.HandleAsync(id, ct)))
            .WithName("GetActivity")
            .Produces<ActivityDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("", async Task<Created<ActivityCreatedDto>> (
                CreateActivityCommand command,
                CreateActivityHandler handler,
                CancellationToken ct) =>
            {
                var result = await handler.HandleAsync(command, ct);
                return TypedResults.Created($"/api/activities/{result.Id}", result);
            })
            .RequireAuthorization("Staff")
            .WithName("CreateActivity")
            .Produces<ActivityCreatedDto>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status403Forbidden);

        group.MapGet("/{id:int}/qr", async Task<Ok<QrResponse>> (
                int id,
                GetActivityQrHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(new QrResponse(await handler.HandleAsync(id, ct))))
            .RequireAuthorization("Staff")
            .WithName("GetActivityQr")
            .Produces<QrResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/{id:int}/register", async Task<Created<RegistrationResultDto>> (
                int id,
                RegisterForActivityHandler handler,
                CancellationToken ct) =>
            {
                var result = await handler.HandleAsync(id, ct);
                return TypedResults.Created($"/api/participations/{result.Id}", result);
            })
            .WithName("RegisterForActivity")
            .Produces<RegistrationResultDto>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapPost("/{id:int}/check-in", async Task<NoContent> (
                int id,
                CheckInRequest request,
                CheckInHandler handler,
                CancellationToken ct) =>
            {
                await handler.HandleAsync(new CheckInCommand(id, request.Code), ct);
                return TypedResults.NoContent();
            })
            .WithName("CheckIn")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapGet("/{id:int}/participations", async Task<Ok<IReadOnlyList<ActivityParticipationDto>>> (
                int id,
                GetActivityParticipationsHandler handler,
                CancellationToken ct) =>
            TypedResults.Ok(await handler.HandleAsync(id, ct)))
            .RequireAuthorization("Staff")
            .WithName("GetActivityParticipations")
            .Produces<IReadOnlyList<ActivityParticipationDto>>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }
}

public sealed record QrResponse(string Qr);
