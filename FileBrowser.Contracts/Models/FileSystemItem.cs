using System.ComponentModel.DataAnnotations;

namespace FileBrowser.Contracts.Models
{
    public class FileSystemItem
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Path { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty; // "file" or "directory"
        
        public long? Size { get; set; }
        
        public DateTime? LastModified { get; set; }
        
        public string? Extension { get; set; }
        
        public bool IsDirectory => Type.Equals("directory", StringComparison.OrdinalIgnoreCase);
        
        public bool IsFile => Type.Equals("file", StringComparison.OrdinalIgnoreCase);
    }
}
