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
    type: data.type || FileSystemItemType.File,
    size: data.size || null,
    lastModified: data.lastModified || null,
    extension: data.extension || null,
  };

  // Add computed properties
  Object.defineProperty(item, "isDirectory", {
    get: function () {
      return this.type === FileSystemItemType.Directory;
    },
  });

  Object.defineProperty(item, "isFile", {
    get: function () {
      return this.type === FileSystemItemType.File;
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
