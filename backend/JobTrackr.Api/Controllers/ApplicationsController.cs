using System.Security.Claims;
using JobTrackr.Api.Dtos;
using JobTrackr.Api.Models;
using JobTrackr.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrackr.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _service;
    public ApplicationsController(IApplicationService service) => _service = service;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>List the current user's applications, optionally filtered by status.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ApplicationReadDto>>> GetAll([FromQuery] ApplicationStatus? status)
    {
        // Enum model-binding accepts arbitrary integers (e.g. ?status=99); reject
        // undefined values with a 400 instead of silently returning an empty list.
        if (status is not null && !Enum.IsDefined(status.Value))
            return BadRequest(new { error = $"'{(int)status.Value}' is not a valid status." });

        return Ok(await _service.GetAllAsync(UserId, status));
    }

    /// <summary>Dashboard summary (totals and counts per status).</summary>
    [HttpGet("stats")]
    public async Task<ActionResult<StatsDto>> GetStats()
        => Ok(await _service.GetStatsAsync(UserId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApplicationReadDto>> Get(int id)
    {
        var app = await _service.GetAsync(UserId, id);
        return app is null ? NotFound() : Ok(app);
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationReadDto>> Create(ApplicationCreateDto dto)
    {
        var created = await _service.CreateAsync(UserId, dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ApplicationUpdateDto dto)
    {
        var (ok, error) = await _service.UpdateAsync(UserId, id, dto);
        if (ok) return NoContent();
        // A null error means "not found"; a message means the status change was rejected.
        return error is null ? NotFound() : BadRequest(new { error });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await _service.DeleteAsync(UserId, id) ? NoContent() : NotFound();
}
