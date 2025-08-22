namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Represents the result of a file upload operation
    /// </summary>
    public class UploadResult
    {
        public bool Success { get; private set; }
        public string? Message { get; private set; }
        public string? FilePath { get; private set; }
        public long? FileSize { get; private set; }

        private UploadResult() { }

        public static UploadResult CreateSuccess(string filePath, long fileSize, string? message = null)
        {
            return new UploadResult
            {
                Success = true,
                Message = message ?? "File uploaded successfully",
                FilePath = filePath,
                FileSize = fileSize
            };
        }

        public static UploadResult CreateFailure(string errorMessage)
        {
            return new UploadResult
            {
                Success = false,
                Message = errorMessage ?? throw new ArgumentNullException(nameof(errorMessage)),
                FilePath = null,
                FileSize = null
            };
        }
    }
}
