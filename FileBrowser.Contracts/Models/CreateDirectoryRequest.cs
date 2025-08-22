namespace FileBrowser.Contracts.Models
{
    public class CreateDirectoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? ParentPath { get; set; }
    }
}
