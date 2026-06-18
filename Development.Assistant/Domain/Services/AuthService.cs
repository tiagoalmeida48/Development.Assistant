using Development.Assistant.Domain.Models;
using Development.Assistant.Domain.ValueObjects;
using Development.Assistant.Infrastructure.Repositories;
using Development.Assistant.Shared;
using Development.Assistant.Shared.Exceptions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Development.Assistant.Domain.Services;

public class AuthService(UserRepository userRep, PasswordService passwordService)
{
    private UserMod GetByLogin(string login)
    {
        var user = userRep.Search(login: login).FirstOrDefault();
        if (user == null)
            throw new UnauthorizedException("Usuário ou senha inválidos");

        return user;
    }

    public string Login(LoginVo request)
    {
        var user = GetByLogin(request.Login);

        if (!passwordService.VerifyPassword(request.Password, user.Password))
            throw new UnauthorizedException("Usuário ou senha inválidos");

        return GenerateToken(user);
    }

    public bool ValidateToken(string token)
    {
        if (token.IsEmpty())
            return false;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            tokenHandler.ValidateToken(token, Constants.JwtConfig.GetValidationParameters(), out _);
            return true;
        }
        catch (SecurityTokenException)
        {
            return false;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }

    public string GenerateToken(UserMod user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(Constants.JwtConfig.SecretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims, JwtBearerDefaults.AuthenticationScheme),
            Expires = DateTime.UtcNow.AddHours(12),
            Issuer = Constants.JwtConfig.Issuer,
            Audience = Constants.JwtConfig.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };


        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}