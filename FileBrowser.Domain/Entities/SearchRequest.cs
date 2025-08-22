namespace FileBrowser.Domain.Entities
{
    /// <summary>
    /// Represents search criteria for finding files and directories
    /// </summary>
    public class SearchRequest
    {
        public string Query { get; private set; }
        public string? Path { get; private set; }
        public bool IncludeSubdirectories { get; private set; }
        public bool SearchInFileNames { get; private set; }
        public bool SearchInFileContents { get; private set; }
        public int MaxResults { get; private set; }

        private SearchRequest() { }

        public static SearchRequest Create(
            string query,
            string? path = null,
            bool includeSubdirectories = true,
            bool searchInFileNames = true,
            bool searchInFileContents = false,
            int maxResults = 100)
        {
            if (string.IsNullOrWhiteSpace(query))
                throw new ArgumentException("Search query cannot be empty", nameof(query));

            if (maxResults <= 0)
                throw new ArgumentException("Max results must be greater than zero", nameof(maxResults));

            return new SearchRequest
            {
                Query = query.Trim(),
                Path = path?.Trim(),
                IncludeSubdirectories = includeSubdirectories,
                SearchInFileNames = searchInFileNames,
                SearchInFileContents = searchInFileContents,
                MaxResults = maxResults
            };
        }
    }
}
