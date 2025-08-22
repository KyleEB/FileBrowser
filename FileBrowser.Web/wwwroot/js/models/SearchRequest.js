/**
 * Search Request Model
 * Matches the backend SearchRequest contract
 */
class SearchRequest {
  constructor(data = {}) {
    this.query = data.query || "";
    this.path = data.path || "";
    this.includeSubdirectories = data.includeSubdirectories || false;
    this.searchInFileNames = data.searchInFileNames || true;
    this.searchInFileContents = data.searchInFileContents || false;
    this.maxResults = data.maxResults || 100;
  }

  /**
   * Create a SearchRequest from API request data
   * @param {Object} data - API request data
   * @returns {SearchRequest} New SearchRequest instance
   */
  static fromApiRequest(data) {
    return new SearchRequest({
      query: data.query,
      path: data.path,
      includeSubdirectories: data.includeSubdirectories,
      searchInFileNames: data.searchInFileNames,
      searchInFileContents: data.searchInFileContents,
      maxResults: data.maxResults,
    });
  }

  /**
   * Convert to plain object for API requests
   * @returns {Object} Plain object representation
   */
  toApiRequest() {
    return {
      query: this.query,
      path: this.path,
      includeSubdirectories: this.includeSubdirectories,
      searchInFileNames: this.searchInFileNames,
      searchInFileContents: this.searchInFileContents,
      maxResults: this.maxResults,
    };
  }

  /**
   * Validate the search request
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.query || this.query.trim() === "") {
      errors.push("Search query is required");
    }

    if (this.maxResults < 1 || this.maxResults > 1000) {
      errors.push("Max results must be between 1 and 1000");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = SearchRequest;
} else {
  window.SearchRequest = SearchRequest;
}
