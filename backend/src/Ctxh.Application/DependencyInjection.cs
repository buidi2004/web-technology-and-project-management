using Ctxh.Application.Features.Activities;
using Ctxh.Application.Features.Auth;
using Ctxh.Application.Features.Me;
using Ctxh.Application.Features.Participations;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Ctxh.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);

        // Auth
        services.AddScoped<LoginHandler>();
        services.AddScoped<RegisterHandler>();
        services.AddScoped<IValidator<LoginCommand>, LoginCommandValidator>();
        services.AddScoped<IValidator<RegisterCommand>, RegisterCommandValidator>();

        // Activities
        services.AddScoped<CreateActivityHandler>();
        services.AddScoped<GetActivitiesHandler>();
        services.AddScoped<GetActivityHandler>();
        services.AddScoped<GetActivityQrHandler>();
        services.AddScoped<GetActivityParticipationsHandler>();
        services.AddScoped<IValidator<CreateActivityCommand>, CreateActivityCommandValidator>();

        // Participations
        services.AddScoped<RegisterForActivityHandler>();
        services.AddScoped<CheckInHandler>();
        services.AddScoped<VerifyParticipationHandler>();
        services.AddScoped<GetMyParticipationsHandler>();
        services.AddScoped<IValidator<CheckInCommand>, CheckInCommandValidator>();

        // Me
        services.AddScoped<GetMeHandler>();
        services.AddScoped<GetMySummaryHandler>();

        return services;
    }
}
