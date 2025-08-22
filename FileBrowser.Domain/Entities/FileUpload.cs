namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Represents a file to be uploaded
    /// </summary>
    public class FileUpload
    {
        public string FileName { get; private set; }
        public long Length { get; private set; }
        public Stream Stream { get; private set; }

        private FileUpload() { }

        public static FileUpload Create(string fileName, long length, Stream stream)
        {
            return new FileUpload
            {
                FileName = fileName ?? throw new ArgumentNullException(nameof(fileName)),
                Length = length,
                Stream = stream ?? throw new ArgumentNullException(nameof(stream))
            };
        }
    }
}
