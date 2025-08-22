using System.ComponentModel.DataAnnotations;

namespace FileBrowser.Contracts.Models
{
    public class SearchRequest
    {
        [Required]
        public string Query { get; set; } = string.Empty;
        
        public string? Path { get; set; }
        
        public bool IncludeSubdirectories { get; set; } = true;
        
        public bool SearchInFileNames { get; set; } = true;
        
        public bool SearchInFileContents { get; set; } = false;
        
        public int MaxResults { get; set; } = 100;
    }
}
