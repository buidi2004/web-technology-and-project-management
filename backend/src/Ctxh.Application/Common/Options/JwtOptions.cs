namespace Ctxh.Application.Common.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "ctxh-api";
    public string Audience { get; set; } = "ctxh-clients";
    public string Key { get; set; } = string.Empty;
    public int ExpiryDays { get; set; } = 7;
}
