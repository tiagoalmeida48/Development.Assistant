using System.ComponentModel.DataAnnotations.Schema;

namespace Development.Assistant.Modules.Models;

public class ColumnInfoMod
{
    public string Name { get; set; }
    public string Type { get; set; }

    [Column("is_primary_key")]
    public bool IsPrimaryKey { get; set; }

    [Column("is_identity")]
    public bool IsIdentity { get; set; }

    [Column("is_nullable")]
    public bool IsNullable { get; set; }
}
