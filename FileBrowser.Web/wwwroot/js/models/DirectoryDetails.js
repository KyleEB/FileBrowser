/**
 * Directory Details Model
 * Matches the backend DirectoryDetails contract
 */
class DirectoryDetails {
  constructor(data = {}) {
    this.path = data.path || '';
    this.items = (data.items || []).map(item => FileSystemItem.fromApiResponse(item));
    this.fileCount = data.fileCount || 0;
    this.directoryCount = data.directoryCount || 0;
    this.totalSize = data.totalSize || 0;
    this.parentPath = data.parentPath || null;
    this.exists = data.exists || false;
    this.errorMessage = data.errorMessage || null;
  }

  /**
   * Create a DirectoryDetails from API response data
   * @param {Object} data - API response data
   * @returns {DirectoryDetails} New DirectoryDetails instance
   */
  static fromApiResponse(data) {
    return new DirectoryDetails({
      path: data.path,
      items: data.items,
      fileCount: data.fileCount,
      directoryCount: data.directoryCount,
      totalSize: data.totalSize,
      parentPath: data.parentPath,
      exists: data.exists,
      errorMessage: data.errorMessage
    });
  }

  /**
   * Convert to plain object for API requests
   * @returns {Object} Plain object representation
   */
  toApiRequest() {
    return {
      path: this.path,
      items: this.items.map(item => item.toApiRequest()),
      fileCount: this.fileCount,
      directoryCount: this.directoryCount,
      totalSize: this.totalSize,
      parentPath: this.parentPath,
      exists: this.exists,
      errorMessage: this.errorMessage
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = DirectoryDetails;
} else {
  window.DirectoryDetails = DirectoryDetails;
}
