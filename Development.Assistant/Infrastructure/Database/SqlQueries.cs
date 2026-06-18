namespace Development.Assistant.Infrastructure.Database;

public static class SqlQueries
{
    public static class MySql
    {
        public const string GetColumns = """
                                         SELECT
                                             COLUMN_NAME AS name,
                                             DATA_TYPE AS type,
                                             CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END AS IS_NULLABLE,
                                             CASE WHEN COLUMN_KEY = 'PRI' THEN 1 ELSE 0 END AS is_primary_key,
                                             CASE WHEN EXTRA <> '' AND EXTRA IS NOT NULL THEN 1 ELSE 0 END AS is_identity
                                         FROM INFORMATION_SCHEMA.COLUMNS
                                         WHERE TABLE_NAME = '{0}' AND TABLE_SCHEMA = DATABASE() AND COLUMN_NAME NOT IN ('CREATED', 'UPDATED')
                                         GROUP BY COLUMN_NAME, DATA_TYPE, DATA_TYPE, COLUMN_KEY, EXTRA
                                         ORDER BY ORDINAL_POSITION
                                         """;

        public const string GetTables = "SHOW TABLES";

        public const string GetDatabaseName = "SELECT DATABASE()";

        public const string GetCountRegisters = "SELECT COUNT(1) FROM `{0}`";
    }

    public static class SqlServer
    {
        public const string GetColumns = """
                                         SELECT
                                             c.COLUMN_NAME AS name,
                                             c.DATA_TYPE AS type,
                                             CASE WHEN c.IS_NULLABLE = 'YES' THEN 1 ELSE 0 END AS IS_NULLABLE,
                                             CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
                                             COLUMNPROPERTY(OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') AS is_identity
                                         FROM INFORMATION_SCHEMA.COLUMNS c
                                         LEFT JOIN (
                                             SELECT ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
                                             FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                             INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = ku.TABLE_SCHEMA AND tc.TABLE_NAME = ku.TABLE_NAME
                                             WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                                         ) pk ON c.TABLE_SCHEMA = pk.TABLE_SCHEMA AND c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
                                         WHERE c.TABLE_NAME = '{0}' AND c.TABLE_SCHEMA = SCHEMA_NAME() AND c.COLUMN_NAME NOT IN ('CREATED', 'UPDATED')
                                         ORDER BY c.ORDINAL_POSITION
                                         """;

        public const string GetTables = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = SCHEMA_NAME()";

        public const string GetDatabaseName = "SELECT DB_NAME()";

        public const string GetCountRegisters = "SELECT COUNT(1) FROM [{0}]";
    }

    public static class Oracle
    {
        public const string GetColumns = """
                                         SELECT
                                             c.COLUMN_NAME AS name,
                                             c.DATA_TYPE AS type,
                                             CASE WHEN c.NULLABLE = 'Y' THEN 1 ELSE 0 END AS IS_NULLABLE,
                                             CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
                                             CASE WHEN c.IDENTITY_COLUMN = 'YES' THEN 1 ELSE 0 END AS is_identity
                                         FROM ALL_TAB_COLUMNS c
                                         LEFT JOIN (
                                             SELECT acc.OWNER, acc.TABLE_NAME, acc.COLUMN_NAME
                                             FROM ALL_CONSTRAINTS ac
                                             INNER JOIN ALL_CONS_COLUMNS acc ON ac.CONSTRAINT_NAME = acc.CONSTRAINT_NAME AND ac.OWNER = acc.OWNER
                                             WHERE ac.CONSTRAINT_TYPE = 'P'
                                         ) pk ON c.OWNER = pk.OWNER AND c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
                                         WHERE c.TABLE_NAME = '{0}' AND c.OWNER = SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AND c.COLUMN_NAME NOT IN ('CREATED', 'UPDATED')
                                         ORDER BY c.COLUMN_ID
                                         """;

        public const string GetTables = "SELECT TABLE_NAME FROM USER_TABLES";

        public const string GetDatabaseName = "SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM DUAL";

        public const string GetCountRegisters = "SELECT COUNT(1) FROM {0}";
    }

    public static class PostgreSql
    {
        public const string GetColumns = """
                                         SELECT cols.column_name AS Name,
                                                cols.data_type AS Type,
                                                CASE WHEN cols.is_nullable IS NOT NULL AND cols.is_nullable = 'YES' THEN true ELSE false END AS is_nullable,
                                                CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END AS is_primary_key,
                                                CASE WHEN cols.column_default LIKE 'nextval%' THEN true ELSE false END AS is_identity
                                            FROM information_schema.columns AS cols
                                            LEFT JOIN information_schema.key_column_usage AS kcu ON cols.table_name = kcu.table_name AND cols.column_name = kcu.column_name AND cols.table_schema = kcu.table_schema
                                            LEFT JOIN information_schema.table_constraints AS tc ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema AND tc.constraint_type = 'PRIMARY KEY'
                                            WHERE cols.table_name = '{0}' AND cols.table_schema = '{1}' AND cols.COLUMN_NAME NOT IN ('created', 'updated')
                                         """;

        public const string GetTables = "SELECT table_name FROM information_schema.tables WHERE table_schema = '{0}'";

        public const string GetDatabaseName = "SELECT current_database()";

        public const string GetCountRegisters = "SELECT COUNT(1) FROM {0}.{1}";
    }
}