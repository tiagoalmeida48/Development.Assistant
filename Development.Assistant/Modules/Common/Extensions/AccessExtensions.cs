
using Development.Assistant.Modules.Common.Extensions;
using System.IdentityModel.Tokens.Jwt;

namespace Development.Assistant.Modules.Common.Http;

public static class AccessExtensions
{
    public static string GetToken(this HttpContext ctx)
    {
        var key = ctx.GetKeyHeader("Authorization");
        if (key.IsEmpty()) return string.Empty;

        var keyParts = key.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return keyParts.Length > 1 ? keyParts[1] : keyParts[0];
    }

    public static int DecodeJwt(this string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var nameIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid");

            if (nameIdClaim == null || !int.TryParse(nameIdClaim.Value, out var userId))
                throw new UnauthorizedException("Token inválido ou malformado");

            return userId;
        }
        catch (Exception ex) when (ex.GetType().Name == "SecurityTokenException")
        {
            throw new UnauthorizedException($"Erro ao validar token: {ex.Message}");
        }
    }

    private static string GetKeyHeader(this HttpContext ctx, string key)
    {
        if (!ctx.Request.Headers.TryGetValue(key, out var value)) return string.Empty;

        return value.FirstOrDefault();
    }
}