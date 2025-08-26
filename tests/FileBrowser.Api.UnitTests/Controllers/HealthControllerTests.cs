using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using Xunit;
using FileBrowser.Api.Controllers;

namespace FileBrowser.Api.UnitTests.Controllers
{
    public class HealthControllerTests
    {
        private readonly HealthController _controller;

        public HealthControllerTests()
        {
            _controller = new HealthController();
        }

        [Fact]
        public void Get_ReturnsOkResultWithHealthyMessage()
        {
            // Arrange
            // No setup needed for this simple controller

            // Act
            var result = _controller.Get();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            okResult!.Value.Should().Be("healthy");
            okResult.StatusCode.Should().Be(200);
        }
    }
}
