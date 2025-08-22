namespace FileBrowser.Contracts.Models
{
    public class DirectoryDetails
    {
        public string Path { get; set; } = string.Empty;
        
        public List<FileSystemItem> Items { get; set; } = new();
        
        public int FileCount { get; set; }
        
        public int DirectoryCount { get; set; }
        
        public long TotalSize { get; set; }
        
        public string? ParentPath { get; set; }
        
        public bool Exists { get; set; }
        
        public string? ErrorMessage { get; set; }
    }
}
