using Development.Assistant.Back.Dto;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;
using Development.Assistant.Back.Utils;
using Development.Assistant.Back.Vo;
using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Development.Assistant.Back.Services;

public class AuthService(UserRepository userRep)
{
    public UserMod Get(int id)
    {
        var user = userRep.Search(id).FirstOrDefault();
        if (user == null)
            throw new Exception("Usuário não encontrado");

        return user;
    }

    private UserMod GetByLogin(string login)
    {
        var user = userRep.Search(login: login).FirstOrDefault();
        if (user == null)
            throw new Exception("Usuário ou senha inválidos");

        return user;
    }

    public IEnumerable<UserMod> All()
    {
        var users = userRep.Search();
        return users;
    }

    public string Login(LoginVo request)
    {
        var user = GetByLogin(request.Login);

        if (!VerifyPassword(request.Password, user.Password))
            throw new Exception("Usuário ou senha inválidos");

        return GenerateToken(user);
    }

    public bool Create(UserMod request)
    {
        var existingUser = userRep.Search(login: request.Login).FirstOrDefault();
        if (existingUser != null)
            throw new Exception("Usuário já existe");

        var user = new UserMod
        {
            Username = request.Username,
            Login = request.Login,
            Password = HashPassword(request.Password)
        };

        userRep.Create(user);
        return true;
    }

    public bool Update(UserMod request)
    {
        var oldUser = userRep.Search(request.Id).FirstOrDefault();
        if (oldUser == null)
            throw new Exception("Usuário não existe");

        var user = new UserMod
        {
            Id = request.Id,
            Username = request.Username,
            Login = request.Login,
            Password = HashPassword(request.Password)
        };

        userRep.Update(user);
        return true;
    }

    public string GenerateToken(UserMod user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(Constants.JwtConfig.SecretKey);

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

    public string HashPassword(string password)
    {
        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
        argon2.Salt = GenerateSalt();
        argon2.DegreeOfParallelism = 8;
        argon2.Iterations = 4;
        argon2.MemorySize = 65536; // 64 MB

        var hash = argon2.GetBytes(32);
        var salt = argon2.Salt;

        var combined = new byte[salt.Length + hash.Length];
        Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
        Buffer.BlockCopy(hash, 0, combined, salt.Length, hash.Length);

        return Convert.ToBase64String(combined);

    }

    private static byte[] GenerateSalt()
    {
        var buffer = new byte[16];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(buffer);
        return buffer;
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        var combined = Convert.FromBase64String(passwordHash);
        var salt = new byte[16];
        var hash = new byte[32];

        Buffer.BlockCopy(combined, 0, salt, 0, 16);
        Buffer.BlockCopy(combined, 16, hash, 0, 32);

        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = 8,
            Iterations = 4,
            MemorySize = 65536
        };

        var hashToVerify = argon2.GetBytes(32);
        return hash.SequenceEqual(hashToVerify);
    }
}

public static class Access
{

    public static string GetToken(this HttpContext ctx)
    {
        var key = ctx.GetKeyHeader("Authorization");
        if (key.IsEmpty()) return string.Empty;

        var keySpt = key.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (keySpt.Length > 1)
            return keySpt[1];

        return keySpt[0];
    }

    public static int DecodeJwt(this string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        return int.Parse(jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid").Value);
    }

    private static string GetKeyHeader(this HttpContext ctx, string key)
    {
        if (!ctx.Request.Headers.TryGetValue(key, out var value)) return string.Empty;

        var newValue = value.FirstOrDefault();
        return newValue;
    }
}