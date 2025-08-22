using Microsoft.AspNetCore.Mvc;

namespace FileBrowser.Api.Controllers
{
    /// <summary>
    /// Health check controller for monitoring
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// Simple health check endpoint
        /// </summary>
        /// <returns>Health status</returns>
        [HttpGet]
        public ActionResult<string> Get()
        {
            return Ok("healthy");
        }
    }
}
