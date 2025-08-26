namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Represents information about a directory including its contents and statistics
    /// </summary>
    public class DirectoryDetails
    {
        public string Path { get; private set; }
        public IReadOnlyList<FileSystemItem> Items { get; private set; }
        public int FileCount { get; private set; }
        public int DirectoryCount { get; private set; }
        public long TotalSize { get; private set; }
        public string? ParentPath { get; private set; }
        public bool Exists { get; private set; }
        public string? ErrorMessage { get; private set; }

        private DirectoryDetails() { }

        public static DirectoryDetails CreateExisting(
            string path,
            IEnumerable<FileSystemItem> items,
            string? parentPath = null)
        {
            var itemsList = items?.ToList() ?? new List<FileSystemItem>();
            var fileCount = itemsList.Count(item => item is FileItem);
            var directoryCount = itemsList.Count(item => item is DirectoryItem);
            var totalSize = itemsList.OfType<FileItem>().Sum(item => item.Size ?? 0);

            return new DirectoryDetails
            {
                Path = path ?? throw new ArgumentNullException(nameof(path)),
                Items = itemsList.AsReadOnly(),
                FileCount = fileCount,
                DirectoryCount = directoryCount,
                TotalSize = totalSize,
                ParentPath = parentPath,
                Exists = true,
                ErrorMessage = null
            };
        }

        public static DirectoryDetails CreateNonExistent(string path, string errorMessage)
        {
            return new DirectoryDetails
            {
                Path = path ?? throw new ArgumentNullException(nameof(path)),
                Items = new List<FileSystemItem>().AsReadOnly(),
                FileCount = 0,
                DirectoryCount = 0,
                TotalSize = 0,
                ParentPath = null,
                Exists = false,
                ErrorMessage = errorMessage ?? throw new ArgumentNullException(nameof(errorMessage))
            };
        }
    }
}
