namespace FileBrowser.Contracts.Models
{
    public class DirectoryInfo
    {
        public string Path { get; set; } = string.Empty;
        public bool Exists { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
