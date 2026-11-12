using Ctxh.Application.Features.Participations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ctxh.Api.Endpoints;

public sealed record VerifyRequest(bool Approve);

public static class ParticipationEndpoints
{
    public static IEndpointRouteBuilder MapParticipationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/participations")
            .WithTags("Participations")
            .RequireAuthorization();

        group.MapPost("/{id:int}/verify", async Task<NoContent> (
                int id,
                VerifyRequest request,
                VerifyParticipationHandler handler,
                CancellationToken ct) =>
            {
                await handler.HandleAsync(new VerifyParticipationCommand(id, request.Approve), ct);
                return TypedResults.NoContent();
            })
            .RequireAuthorization("Staff")
            .WithName("VerifyParticipation")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return app;
    }
}
