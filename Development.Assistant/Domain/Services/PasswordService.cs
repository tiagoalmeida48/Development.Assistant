using Konscious.Security.Cryptography;
using Development.Assistant.Shared;
using System.Security.Cryptography;
using System.Text;

namespace Development.Assistant.Domain.Services;

public class PasswordService
{
    public string HashPassword(string password)
    {
        using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password));
        argon2.Salt = GenerateSalt();
        argon2.DegreeOfParallelism = 8;
        argon2.Iterations = 4;
        argon2.MemorySize = 65536;

        var hash = argon2.GetBytes(32);
        var salt = argon2.Salt;

        var combined = new byte[salt.Length + hash.Length];
        Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
        Buffer.BlockCopy(hash, 0, combined, salt.Length, hash.Length);

        return Convert.ToBase64String(combined);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        if (password.IsEmpty() || passwordHash.IsEmpty())
            return false;

        byte[] combined;
        try
        {
            combined = Convert.FromBase64String(passwordHash);
        }
        catch (FormatException)
        {
            return false;
        }

        if (combined.Length != 48)
            return false;

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
        return CryptographicOperations.FixedTimeEquals(hash, hashToVerify);
    }

    private static byte[] GenerateSalt()
    {
        var buffer = new byte[16];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(buffer);
        return buffer;
    }
}
