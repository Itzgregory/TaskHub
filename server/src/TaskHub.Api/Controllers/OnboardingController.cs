using Microsoft.AspNetCore.Mvc;
using TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;

namespace TaskHub.Api.Controllers;

public class OnboardingController : BaseApiController
{
    private readonly CompleteOnboardingHandler _completeOnboardingHandler;

    public OnboardingController(CompleteOnboardingHandler completeOnboardingHandler)
    {
        _completeOnboardingHandler = completeOnboardingHandler;
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] CompleteOnboardingCommand command)
    {
        var result = await _completeOnboardingHandler.HandleAsync(command);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result.Value);
    }
}
