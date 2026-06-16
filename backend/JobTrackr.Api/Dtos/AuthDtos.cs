using System.ComponentModel.DataAnnotations;

namespace JobTrackr.Api.Dtos;

public record RegisterDto
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; init; } = string.Empty;
}

public record LoginDto
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}

public record AuthResponse(string Token, string Email);
