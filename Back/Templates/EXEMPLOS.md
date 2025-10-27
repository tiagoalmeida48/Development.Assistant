# 💡 Exemplos Práticos de Uso do Scriban

## **🎯 Casos de Uso Comuns**

---

## **1. Adicionar Auditoria Automática**

### **Modificar `DomainService.scriban`:**

```scriban
using {{ project_name }}.Domain.Interfaces.Repository{{ namespace }};
using {{ project_name }}.Domain.Interfaces.Services{{ namespace }};
using {{ project_name }}.Domain.Models{{ namespace }};
using System;

namespace {{ project_name }}.Domain.Services{{ namespace }}
{
    public class {{ table_name }}Service : I{{ table_name }}Service
    {
        readonly I{{ table_name }}Repository _repository;

        public {{ table_name }}Service(I{{ table_name }}Repository repository)
        {
            _repository = repository;
        }

        public bool Create({{ table_name }}Mod model)
        {
            // ✨ AUDITORIA AUTOMÁTICA
            model.CreatedAt = DateTime.UtcNow;
            model.CreatedBy = "System"; // TODO: Obter usuário logado
            model.IsActive = true;

            return _repository.Create(model);
        }

        public bool Update({{ table_name }}Mod model)
        {
            // ✨ AUDITORIA AUTOMÁTICA
            model.UpdatedAt = DateTime.UtcNow;
            model.UpdatedBy = "System"; // TODO: Obter usuário logado

            return _repository.Update(model);
        }

        public bool Delete({{ columns_key }})
        {
            // ✨ SOFT DELETE
            var model = _repository.Get({{ columns_key_names }}, 0);
            if (model == null) return false;

            model.IsActive = false;
            model.DeletedAt = DateTime.UtcNow;
            model.DeletedBy = "System"; // TODO: Obter usuário logado

            return _repository.Update(model);
        }
    }
}
```

---

## **2. Adicionar Caching**

### **Criar novo template `AppServiceWithCache.scriban`:**

```scriban
using {{ project_name }}.App.Dto{{ namespace }};
using {{ project_name }}.App.Interfaces{{ namespace }};
using {{ project_name }}.Domain.Interfaces.Services{{ namespace }};
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;

namespace {{ project_name }}.App.Services{{ namespace }}
{
    public class {{ table_name }}AppService : I{{ table_name }}AppService
    {
        private readonly I{{ table_name }}Service _service;
        private readonly IMemoryCache _cache;
        private const int CACHE_MINUTES = 5;

        public {{ table_name }}AppService(
            I{{ table_name }}Service service,
            IMemoryCache cache)
        {
            _service = service;
            _cache = cache;
        }

        public IEnumerable<{{ table_name }}DisplayDto> All(int language, int ordination, bool desc, long quantityRegister)
        {
            var cacheKey = $"{{ table_name }}_All_{language}_{ordination}_{desc}_{quantityRegister}";

            return _cache.GetOrCreate(cacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CACHE_MINUTES);
                var result = _service.All(language, ordination, desc, quantityRegister);
                return result.Select(x => new {{ table_name }}DisplayDto
                {
                    // TODO: Map properties
                });
            });
        }

        public {{ table_name }}DisplayDto Get({{ columns_key }}, int language)
        {
            var cacheKey = $"{{ table_name }}_Get_{{{ columns_key_names }}}_{{language}}";

            return _cache.GetOrCreate(cacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CACHE_MINUTES);
                var result = _service.Get({{ columns_key_names }}, language);
                return new {{ table_name }}DisplayDto
                {
                    // TODO: Map properties
                };
            });
        }

        public bool Create({{ table_name }}CreateDto dto)
        {
            var model = new {{ table_name }}Mod { /* Map */ };
            var result = _service.Create(model);

            // Invalidar cache
            if (result)
            {
                _cache.Remove($"{{ table_name }}_All");
            }

            return result;
        }
    }
}
```

---

## **3. Gerar Repository com Stored Procedures**

### **Criar `RepositoryWithSP.scriban`:**

```scriban
using Dapper;
using {{ project_name }}.Domain.Interfaces.Repository{{ namespace }};
using {{ project_name }}.Domain.Models{{ namespace }};
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace {{ project_name }}.Infra.Data.Repository{{ namespace }}
{
    public class {{ table_name }}Repository : I{{ table_name }}Repository
    {
        private readonly IDbConnection _connection;

        public {{ table_name }}Repository(IDbConnection connection)
        {
            _connection = connection;
        }

        public IEnumerable<{{ table_name }}Mod> All(int language, int ordination, bool desc, long quantityRegister)
        {
            return _connection.Query<{{ table_name }}Mod>(
                "sp_{{ table_name }}_GetAll",
                new { Language = language, Ordination = ordination, Desc = desc, QuantityRegister = quantityRegister },
                commandType: CommandType.StoredProcedure
            );
        }

        public {{ table_name }}Mod Get({{ columns_key }}, int language)
        {
            return _connection.QueryFirstOrDefault<{{ table_name }}Mod>(
                "sp_{{ table_name }}_GetById",
                new { {{ primary_key_params }}, Language = language },
                commandType: CommandType.StoredProcedure
            );
        }

        public bool Create({{ table_name }}Mod model)
        {
            var result = _connection.Execute(
                "sp_{{ table_name }}_Create",
                model,
                commandType: CommandType.StoredProcedure
            );
            return result > 0;
        }

        public bool Update({{ table_name }}Mod model)
        {
            var result = _connection.Execute(
                "sp_{{ table_name }}_Update",
                model,
                commandType: CommandType.StoredProcedure
            );
            return result > 0;
        }

        public bool Delete({{ columns_key }})
        {
            var result = _connection.Execute(
                "sp_{{ table_name }}_Delete",
                new { {{ primary_key_params }} },
                commandType: CommandType.StoredProcedure
            );
            return result > 0;
        }
    }
}
```

---

## **4. Gerar DTOs Automapper**

### **Criar `AutoMapperProfile.scriban`:**

```scriban
using AutoMapper;
using {{ project_name }}.App.Dto{{ namespace }};
using {{ project_name }}.Domain.Models{{ namespace }};

namespace {{ project_name }}.App.Mappings{{ namespace }}
{
    public class {{ table_name }}MappingProfile : Profile
    {
        public {{ table_name }}MappingProfile()
        {
            // Model -> DisplayDto
            CreateMap<{{ table_name }}Mod, {{ table_name }}DisplayDto>()
                .ReverseMap();

            // Model -> CreateDto
            CreateMap<{{ table_name }}Mod, {{ table_name }}CreateDto>()
                .ReverseMap();

            // Model -> UpdateDto
            CreateMap<{{ table_name }}Mod, {{ table_name }}UpdateDto>()
                .ReverseMap();

            // CreateDto -> UpdateDto
            CreateMap<{{ table_name }}CreateDto, {{ table_name }}UpdateDto>()
                .ReverseMap();
        }
    }
}
```

### **Atualizar `ScribanCodeGenerator.cs`:**

```csharp
public async Task<string> GenerateAutoMapperProfileAsync(
    string tableName,
    string projectName,
    string nameSpace)
{
    var template = await LoadTemplateAsync("AutoMapperProfile");

    var model = new ScriptObject
    {
        { "table_name", tableName },
        { "project_name", projectName },
        { "namespace", nameSpace }
    };

    var context = new TemplateContext { MemberRenamer = member => member.Name };
    context.PushGlobal(model);

    return await template.RenderAsync(context);
}
```

---

## **5. Gerar Unit Tests**

### **Criar `UnitTest.scriban`:**

```scriban
using Xunit;
using Moq;
using {{ project_name }}.Domain.Services{{ namespace }};
using {{ project_name }}.Domain.Interfaces.Repository{{ namespace }};
using {{ project_name }}.Domain.Models{{ namespace }};
using System.Collections.Generic;
using System.Linq;

namespace {{ project_name }}.Tests.Domain.Services{{ namespace }}
{
    public class {{ table_name }}ServiceTests
    {
        private readonly Mock<I{{ table_name }}Repository> _mockRepository;
        private readonly {{ table_name }}Service _service;

        public {{ table_name }}ServiceTests()
        {
            _mockRepository = new Mock<I{{ table_name }}Repository>();
            _service = new {{ table_name }}Service(_mockRepository.Object);
        }

        [Fact]
        public void All_ShouldReturnList()
        {
            // Arrange
            var expectedData = new List<{{ table_name }}Mod>
            {
                new {{ table_name }}Mod { /* TODO */ },
                new {{ table_name }}Mod { /* TODO */ }
            };

            _mockRepository
                .Setup(x => x.All(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<bool>(), It.IsAny<long>()))
                .Returns(expectedData);

            // Act
            var result = _service.All(1, 1, false, 10);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            _mockRepository.Verify(x => x.All(1, 1, false, 10), Times.Once);
        }

        [Fact]
        public void Create_ShouldCallRepository()
        {
            // Arrange
            var model = new {{ table_name }}Mod { /* TODO */ };

            _mockRepository
                .Setup(x => x.Create(It.IsAny<{{ table_name }}Mod>()))
                .Returns(true);

            // Act
            var result = _service.Create(model);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(x => x.Create(model), Times.Once);
        }

        [Fact]
        public void Delete_ShouldCallRepository()
        {
            // Arrange
            {{ columns_key }}
            // TODO: Inicializar chaves

            _mockRepository
                .Setup(x => x.Delete({{ columns_key_names }}))
                .Returns(true);

            // Act
            var result = _service.Delete({{ columns_key_names }});

            // Assert
            Assert.True(result);
            _mockRepository.Verify(x => x.Delete({{ columns_key_names }}), Times.Once);
        }
    }
}
```

---

## **6. Gerar Validators com FluentValidation**

### **Criar `Validator.scriban`:**

```scriban
using FluentValidation;
using {{ project_name }}.App.Dto{{ namespace }};

namespace {{ project_name }}.App.Validators{{ namespace }}
{
    public class {{ table_name }}CreateDtoValidator : AbstractValidator<{{ table_name }}CreateDto>
    {
        public {{ table_name }}CreateDtoValidator()
        {
            // TODO: Adicionar regras específicas da entidade

            // Exemplo:
            // RuleFor(x => x.Name)
            //     .NotEmpty().WithMessage("Nome é obrigatório")
            //     .MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres");

            // RuleFor(x => x.Email)
            //     .NotEmpty().WithMessage("Email é obrigatório")
            //     .EmailAddress().WithMessage("Email inválido");

            // RuleFor(x => x.Age)
            //     .GreaterThan(0).WithMessage("Idade deve ser maior que 0")
            //     .LessThan(150).WithMessage("Idade deve ser menor que 150");
        }
    }

    public class {{ table_name }}UpdateDtoValidator : AbstractValidator<{{ table_name }}UpdateDto>
    {
        public {{ table_name }}UpdateDtoValidator()
        {
            // TODO: Adicionar regras específicas da entidade
            // Geralmente as mesmas regras do CreateDto + validação de ID
        }
    }
}
```

---

## **7. Usar Funções Customizadas no Template**

### **Adicionar funções helper ao ScribanCodeGenerator:**

```csharp
public async Task<string> GenerateWithCustomFunctionsAsync(
    string tableName,
    string projectName,
    string nameSpace)
{
    var template = await LoadTemplateAsync("Controller");

    var model = new ScriptObject();
    model.Import(new
    {
        table_name = tableName,
        project_name = projectName,
        @namespace = nameSpace
    });

    // Adicionar funções customizadas
    model.Import("pluralize", new Func<string, string>(Pluralize));
    model.Import("singularize", new Func<string, string>(Singularize));
    model.Import("to_snake_case", new Func<string, string>(ToSnakeCase));

    var context = new TemplateContext { MemberRenamer = member => member.Name };
    context.PushGlobal(model);

    return await template.RenderAsync(context);
}

private string Pluralize(string word)
{
    // Implementação simples
    if (word.EndsWith("y"))
        return word.Substring(0, word.Length - 1) + "ies";
    if (word.EndsWith("s"))
        return word + "es";
    return word + "s";
}

private string Singularize(string word)
{
    if (word.EndsWith("ies"))
        return word.Substring(0, word.Length - 3) + "y";
    if (word.EndsWith("es"))
        return word.Substring(0, word.Length - 2);
    if (word.EndsWith("s"))
        return word.Substring(0, word.Length - 1);
    return word;
}

private string ToSnakeCase(string str)
{
    return string.Concat(str.Select((x, i) =>
        i > 0 && char.IsUpper(x) ? "_" + x.ToString() : x.ToString()
    )).ToLower();
}
```

### **Usar no template:**

```scriban
[Route("api/{{ table_name | pluralize | string.downcase }}")]
public class {{ table_name }}Controller : ControllerBase
{
    // Variável de tabela: {{ table_name | to_snake_case }}
    private const string TABLE_NAME = "{{ table_name | to_snake_case }}";
}
```

---

## **8. Gerar Documentação Swagger Automática**

### **Criar `ControllerWithSwagger.scriban`:**

```scriban
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using {{ project_name }}.App.Dto{{ namespace }};
using {{ project_name }}.App.Interfaces{{ namespace }};
using System.Collections.Generic;

namespace {{ project_name }}.Api.Controllers{{ namespace }}
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [SwaggerTag("Gerenciamento de {{ table_name }}")]
    public class {{ table_name }}Controller : ControllerBase
    {
        private readonly I{{ table_name }}AppService _service;

        public {{ table_name }}Controller(I{{ table_name }}AppService service)
        {
            _service = service;
        }

        [HttpGet]
        [SwaggerOperation(
            Summary = "Lista todos os {{ table_name }}",
            Description = "Retorna uma lista paginada de {{ table_name }} com filtros e ordenação",
            OperationId = "Get{{ table_name }}List"
        )]
        [SwaggerResponse(200, "Lista retornada com sucesso", typeof(IEnumerable<{{ table_name }}DisplayDto>))]
        [SwaggerResponse(400, "Requisição inválida")]
        [SwaggerResponse(500, "Erro interno do servidor")]
        public IActionResult GetAll(
            [FromQuery, SwaggerParameter("Coluna para ordenação")] int ordination,
            [FromQuery, SwaggerParameter("Ordenação descendente?")] bool desc,
            [FromQuery, SwaggerParameter("Quantidade de registros")] long quantityRegister)
        {
            var result = _service.All(UserLogged.language, ordination, desc, quantityRegister);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Busca {{ table_name }} por ID",
            Description = "Retorna um {{ table_name }} específico pelo ID",
            OperationId = "Get{{ table_name }}ById"
        )]
        [SwaggerResponse(200, "{{ table_name }} encontrado", typeof({{ table_name }}DisplayDto))]
        [SwaggerResponse(404, "{{ table_name }} não encontrado")]
        public IActionResult Get([FromRoute] {{ columns_key }})
        {
            var result = _service.Get({{ columns_key_names }}, UserLogged.language);
            return result != null ? Ok(result) : NotFound();
        }

        [HttpPost]
        [SwaggerOperation(
            Summary = "Cria novo {{ table_name }}",
            Description = "Cria um novo registro de {{ table_name }}",
            OperationId = "Create{{ table_name }}"
        )]
        [SwaggerResponse(201, "{{ table_name }} criado com sucesso")]
        [SwaggerResponse(400, "Dados inválidos")]
        public IActionResult Create([FromBody, SwaggerRequestBody("Dados do {{ table_name }}")] {{ table_name }}CreateDto dto)
        {
            var result = _service.Create(dto);
            return result ? Created("", null) : BadRequest();
        }
    }
}
```

---

**🎉 Com esses exemplos, você pode criar praticamente qualquer template customizado!**

**Próximos passos:**
1. Escolha um exemplo acima
2. Crie o template `.scriban`
3. Adicione o método correspondente no `ScribanCodeGenerator.cs`
4. Teste a geração
5. Customize conforme sua necessidade!
