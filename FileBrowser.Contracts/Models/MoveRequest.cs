namespace FileBrowser.Contracts.Models
{
    public class MoveRequest
    {
        public string SourcePath { get; set; } = string.Empty;
        public string DestinationPath { get; set; } = string.Empty;
    }
}
