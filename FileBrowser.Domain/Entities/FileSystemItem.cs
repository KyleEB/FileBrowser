namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Base abstract class representing an item in the file system
    /// </summary>
    public abstract class FileSystemItem
    {
        public string Name { get; protected set; }
        public string Path { get; protected set; }
        public DateTime? LastModified { get; protected set; }

        protected FileSystemItem(string name, string path, DateTime? lastModified = null)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Path = path ?? throw new ArgumentNullException(nameof(path));
            LastModified = lastModified;
        }

        public abstract long? Size { get; }
    }

    /// <summary>
    /// Represents a file in the file system
    /// </summary>
    public class FileItem : FileSystemItem
    {
        public long FileSize { get; private set; }
        public string? Extension { get; private set; }

        public override long? Size => FileSize;

        private FileItem(string name, string path, long size, DateTime? lastModified = null, string? extension = null)
            : base(name, path, lastModified)
        {
            FileSize = size;
            Extension = extension;
        }

        public static FileItem Create(string name, string path, long size, DateTime? lastModified = null, string? extension = null)
        {
            return new FileItem(name, path, size, lastModified, extension);
        }
    }

    /// <summary>
    /// Represents a directory in the file system
    /// </summary>
    public class DirectoryItem : FileSystemItem
    {
        public override long? Size => null;

        private DirectoryItem(string name, string path, DateTime? lastModified = null)
            : base(name, path, lastModified)
        {
        }

        public static DirectoryItem Create(string name, string path, DateTime? lastModified = null)
        {
            return new DirectoryItem(name, path, lastModified);
        }
    }


}
