namespace Ctxh.Domain.Exceptions;

/// <summary>Các exception nghiệp vụ được middleware map sang HTTP status tương ứng.</summary>
public class NotFoundException(string message) : Exception(message)
{
    public static NotFoundException For(string entity, object key) =>
        new($"{entity} với khóa '{key}' không tồn tại");
}

public class ConflictException(string message) : Exception(message);

public class ForbiddenException(string message) : Exception(message);

public class UnauthorizedException(string message) : Exception(message);

public class BadRequestException(string message) : Exception(message);
