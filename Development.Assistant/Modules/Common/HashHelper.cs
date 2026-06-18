using System.Security.Cryptography;

namespace Development.Assistant.Modules.Common;

public static class HashHelper
{
    public static string DecryptConnectionString(string connectionString, string key)
    {
        var keyBytes = Convert.FromBase64String(key);
        var bytes = Convert.FromBase64String(connectionString);

        using var aes = Aes.Create();
        var maxKey = CreateSpecialByteArray(aes.Key.Length);
        Array.Copy(keyBytes, maxKey, aes.Key.Length);

        var iv = new byte[16];
        Array.Copy(bytes, 0, iv, 0, iv.Length);

        var decrypt = aes.CreateDecryptor(maxKey, iv);
        var finalSize = Math.Abs(bytes.Length - iv.Length);
        var finalText = new byte[finalSize];

        Array.Copy(bytes, iv.Length, finalText, 0, finalSize);

        using var ms = new MemoryStream(finalText);
        using var cs = new CryptoStream(ms, decrypt, CryptoStreamMode.Read);
        using var reader = new StreamReader(cs);

        return reader.ReadToEnd();
    }

    public static string EncryptConnectionString(string connectionString, string key)
    {
        var keyBytes = Convert.FromBase64String(key);

        using var aes = Aes.Create();
        aes.GenerateIV();
        var maxKey = CreateSpecialByteArray(aes.Key.Length);
        Array.Copy(keyBytes, maxKey, aes.Key.Length);

        var encryptor = aes.CreateEncryptor(maxKey, aes.IV);
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        {
            using var sw = new StreamWriter(cs);
            sw.Write(connectionString);
        }

        var enc = ms.ToArray();
        var encrypted = new byte[enc.Length + aes.IV.Length];

        Array.Copy(aes.IV, encrypted, aes.IV.Length);
        Array.Copy(enc, 0, encrypted, aes.IV.Length, enc.Length);
        return Convert.ToBase64String(encrypted);
    }

    public static byte[] CreateSpecialByteArray(int length)
    {
        var arr = new byte[length];
        for (var i = 0; i < arr.Length; i++)
            arr[i] = 0x42;

        return arr;
    }
}