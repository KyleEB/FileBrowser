namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Represents a file or directory in the file system
    /// </summary>
    public class FileSystemItem
    {
        public string Name { get; private set; }
        public string Path { get; private set; }
        public FileSystemItemType Type { get; private set; }
        public long? Size { get; private set; }
        public DateTime? LastModified { get; private set; }
        public string? Extension { get; private set; }

        public bool IsDirectory => Type == FileSystemItemType.Directory;
        public bool IsFile => Type == FileSystemItemType.File;

        private FileSystemItem() { }

        public static FileSystemItem CreateDirectory(string name, string path, DateTime? lastModified = null)
        {
            return new FileSystemItem
            {
                Name = name ?? throw new ArgumentNullException(nameof(name)),
                Path = path ?? throw new ArgumentNullException(nameof(path)),
                Type = FileSystemItemType.Directory,
                LastModified = lastModified
            };
        }

        public static FileSystemItem CreateFile(string name, string path, long size, DateTime? lastModified = null, string? extension = null)
        {
            return new FileSystemItem
            {
                Name = name ?? throw new ArgumentNullException(nameof(name)),
                Path = path ?? throw new ArgumentNullException(nameof(path)),
                Type = FileSystemItemType.File,
                Size = size,
                LastModified = lastModified,
                Extension = extension
            };
        }
    }

    public enum FileSystemItemType
    {
        File,
        Directory
    }
}
