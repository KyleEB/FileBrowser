namespace FileBrowser.Contracts.Models
{
    public class UploadResponse
    {
        public bool Success { get; set; }
        
        public string? Message { get; set; }
        
        public string? FilePath { get; set; }
        
        public long? FileSize { get; set; }
    }
}
