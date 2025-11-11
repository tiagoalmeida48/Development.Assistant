namespace Development.Assistant.Back.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}