/**
 * File System Item Model
 * Utility functions for working with file system items
 */

/**
 * Create a FileSystemItem object from API response data
 * @param {Object} data - API response data
 * @returns {Object} FileSystemItem object
 */
function createFileSystemItem(data = {}) {
  const item = {
    name: data.name || "",
    path: data.path || "",
    isDirectory: data.isDirectory || false,
    size: data.size || null,
    lastModified: data.lastModified || null,
    extension: data.extension || null,
  };

  // Add computed properties
  Object.defineProperty(item, "isFile", {
    get: function () {
      return !this.isDirectory;
    },
  });

  return item;
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createFileSystemItem };
} else {
  window.FileSystemItem = { createFileSystemItem };
}
