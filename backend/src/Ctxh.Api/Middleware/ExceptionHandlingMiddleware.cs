using Ctxh.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Ctxh.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            if (context.Response.HasStarted)
            {
                logger.LogError(exception, "Lỗi sau khi response đã bắt đầu gửi");
                return;
            }

            await WriteProblemAsync(context, exception);
        }
    }

    private async Task WriteProblemAsync(HttpContext context, Exception exception)
    {
        var (status, title, errors) = exception switch
        {
            ValidationException validation => (
                StatusCodes.Status400BadRequest,
                "Dữ liệu không hợp lệ",
                validation.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),

            BadRequestException => (StatusCodes.Status400BadRequest, exception.Message, null),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, exception.Message, null),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, exception.Message, null),
            ForbiddenException => (StatusCodes.Status403Forbidden, exception.Message, null),
            NotFoundException => (StatusCodes.Status404NotFound, exception.Message, null),
            ConflictException => (StatusCodes.Status409Conflict, exception.Message, null),
            _ => (StatusCodes.Status500InternalServerError, "Đã xảy ra lỗi không mong muốn", null)
        };

        if (status >= StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception tại {Path}", context.Request.Path);
        else
            logger.LogWarning("Nghiệp vụ bị từ chối ({Status}) tại {Path}: {Message}",
                status, context.Request.Path, exception.Message);

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status >= StatusCodes.Status500InternalServerError ? null : exception.Message,
            Instance = context.Request.Path
        };

        if (errors is not null)
            problem.Extensions["errors"] = errors;

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem);
    }
}
