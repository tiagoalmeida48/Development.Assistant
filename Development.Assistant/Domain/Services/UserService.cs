using Development.Assistant.Domain.Models;
using Development.Assistant.Infrastructure.Repositories;
using Development.Assistant.Shared;
using Development.Assistant.Shared.Exceptions;

namespace Development.Assistant.Domain.Services;

public class UserService(UserRepository userRep, PasswordService passwordService)
{
    public UserMod Get(int id)
    {
        var user = userRep.Search(id).FirstOrDefault();
        if (user == null)
            throw new NotFoundException("Usuário não encontrado");

        return user;
    }

    public IEnumerable<UserMod> All()
    {
        return userRep.Search();
    }

    public bool Create(UserMod request)
    {
        var existingUser = userRep.Search(login: request.Login).FirstOrDefault();
        if (existingUser != null)
            throw new BadRequestException("Usuário já existe");

        var user = new UserMod
        {
            Username = request.Username,
            Login = request.Login,
            Password = passwordService.HashPassword(request.Password)
        };

        userRep.Create(user);
        return true;
    }

    public bool Update(UserMod request)
    {
        var oldUser = userRep.Search(request.Id).FirstOrDefault();
        if (oldUser == null)
            throw new NotFoundException("Usuário não existe");

        var userLogged = userRep.GetUserLogged();
        if (userLogged == null)
            throw new UnauthorizedException("Usuário logado não encontrado");

        if (userLogged.Id != request.Id && userLogged.Login != "admin")
            throw new UnauthorizedException("Acesso negado, você só pode alterar seu próprio usuário");

        var user = new UserMod
        {
            Id = request.Id,
            Username = request.Username,
            Login = request.Login,
            Password = request.Password.IsEmpty() ? oldUser.Password : passwordService.HashPassword(request.Password)
        };

        userRep.Update(user);
        return true;
    }
}