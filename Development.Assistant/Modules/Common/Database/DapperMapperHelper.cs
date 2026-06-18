using Dapper;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace Development.Assistant.Modules.Common.Database;

public static class TypeMapper
{
    public static void Initialize(string dllModel, string[] namespaces, string[] excludes)
    {
        var assembly = Assembly.LoadFrom(dllModel);

        var classes = from type in assembly.GetExportedTypes()
                      where type.IsClass
                            && type.Namespace is not null
                            && namespaces.Any(n => type.Namespace.StartsWith(n))
                            && !excludes.Any(e => type.Name.StartsWith(e))
                      select type;

        classes.ToList().ForEach(type =>
        {
            var mapper = (SqlMapper.ITypeMap)Activator.CreateInstance(typeof(ColumnAttributeTypeMapper<>).MakeGenericType(type));
            SqlMapper.SetTypeMap(type, mapper);
        });
    }
}

public class ColumnAttributeTypeMapper<T> : FallBackTypeMapper
{
    public ColumnAttributeTypeMapper() : base([
        new CustomPropertyTypeMap(typeof(T), (type, columnName) =>
                                      type.GetProperties().FirstOrDefault(prop =>
                                                                              prop.GetCustomAttributes(false)
                                                                                  .OfType<ColumnAttribute>()
                                                                                  .Any(attribute => string.Equals(attribute.Name, columnName, StringComparison.CurrentCultureIgnoreCase))
                                      )
        ),
        new DefaultTypeMap(typeof(T))
    ])
    {
    }
}

public class FallBackTypeMapper(IEnumerable<SqlMapper.ITypeMap> mappers) : SqlMapper.ITypeMap
{
    public ConstructorInfo FindConstructor(string[] names, Type[] types)
    {
        foreach (var mapper in mappers)
        {
            try
            {
                var result = mapper.FindConstructor(names, types);

                if (result != null)
                    return result;
            }
            catch (NotImplementedException)
            {
            }
        }
        return null;
    }

    public ConstructorInfo FindExplicitConstructor()
    {
        return mappers
            .Select(mapper => mapper.FindExplicitConstructor())
            .FirstOrDefault(result => result != null);
    }

    public SqlMapper.IMemberMap GetConstructorParameter(ConstructorInfo constructor, string columnName)
    {
        foreach (var mapper in mappers)
        {
            try
            {
                var result = mapper.GetConstructorParameter(constructor, columnName);

                if (result != null)
                    return result;
            }
            catch (NotImplementedException)
            {
            }
        }
        return null;
    }

    public SqlMapper.IMemberMap GetMember(string columnName)
    {
        foreach (var mapper in mappers)
        {
            try
            {
                var result = mapper.GetMember(columnName);

                if (result != null)
                    return result;
            }
            catch (NotImplementedException)
            {
            }
        }
        return null;
    }
}
