using Ctxh.Api.Endpoints;
using Ctxh.Api.Extensions;
using Ctxh.Api.Middleware;
using Ctxh.Application;
using Ctxh.Infrastructure;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors(ApiServiceCollectionExtensions.CorsPolicy);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapActivityEndpoints();
app.MapParticipationEndpoints();
app.MapMeEndpoints();

await app.InitializeDatabaseAsync();

app.Run();

// Cho WebApplicationFactory (integration test) sau này.
public partial class Program;
