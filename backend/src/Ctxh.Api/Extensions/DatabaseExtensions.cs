using Ctxh.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Ctxh.Api.Extensions;

public static class DatabaseExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("Database");

        try
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.MigrateAsync();

            if (app.Configuration.GetValue("Seed:Enabled", true))
                await scope.ServiceProvider.GetRequiredService<DbSeeder>().SeedAsync();

            logger.LogInformation("Database đã sẵn sàng");
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Không kết nối/migrate được database. Kiểm tra ConnectionStrings:Default hoặc chạy docker compose up -d.");
            throw;
        }
    }
}
