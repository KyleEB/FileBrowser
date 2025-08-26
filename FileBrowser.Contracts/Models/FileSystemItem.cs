using System.ComponentModel.DataAnnotations;

namespace FileBrowser.Contracts.Models
{
    public class FileSystemItem
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Path { get; set; } = string.Empty;
        
        public bool IsDirectory { get; set; }
        
        public long? Size { get; set; }
        
        public DateTime? LastModified { get; set; }
        
        public string? Extension { get; set; }
    }
}
