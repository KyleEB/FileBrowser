namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Represents information about the home directory
    /// </summary>
    public class HomeDirectoryResult
    {
        public string Path { get; private set; }
        public bool Exists { get; private set; }
        public string? ErrorMessage { get; private set; }

        private HomeDirectoryResult() { }

        public static HomeDirectoryResult Create(string path, bool exists, string? errorMessage = null)
        {
            return new HomeDirectoryResult
            {
                Path = path ?? throw new ArgumentNullException(nameof(path)),
                Exists = exists,
                ErrorMessage = errorMessage
            };
        }
    }
}
