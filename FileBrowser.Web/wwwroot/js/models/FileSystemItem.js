/**
 * File System Item Model
 * Matches the backend FileSystemItem contract
 */
class FileSystemItem {
  constructor(data = {}) {
    this.name = data.name || "";
    this.path = data.path || "";
    this.type = data.type || FileSystemItemType.File;
    this.size = data.size || null;
    this.lastModified = data.lastModified || null;
    this.extension = data.extension || null;
  }

  /**
   * Check if the item is a directory
   * @returns {boolean} True if the item is a directory
   */
  get isDirectory() {
    return this.type === FileSystemItemType.Directory;
  }

  /**
   * Check if the item is a file
   * @returns {boolean} True if the item is a file
   */
  get isFile() {
    return this.type === FileSystemItemType.File;
  }

  /**
   * Create a FileSystemItem from API response data
   * @param {Object} data - API response data
   * @returns {FileSystemItem} New FileSystemItem instance
   */
  static fromApiResponse(data) {
    return new FileSystemItem({
      name: data.name,
      path: data.path,
      type: data.type,
      size: data.size,
      lastModified: data.lastModified,
      extension: data.extension,
    });
  }

  /**
   * Convert to plain object for API requests
   * @returns {Object} Plain object representation
   */
  toApiRequest() {
    return {
      name: this.name,
      path: this.path,
      type: this.type,
      size: this.size,
      lastModified: this.lastModified,
      extension: this.extension,
    };
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FileSystemItem;
} else {
  window.FileSystemItem = FileSystemItem;
}
