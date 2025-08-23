/**
 * Directory Details Model
 * Utility functions for working with directory details
 */

/**
 * Create a DirectoryDetails object from API response data
 * @param {Object} data - API response data
 * @returns {Object} DirectoryDetails object
 */
function createDirectoryDetails(data = {}) {
  return {
    path: data.path || "",
    items: (data.items || []).map((item) => createFileSystemItem(item)),
    fileCount: data.fileCount || 0,
    directoryCount: data.directoryCount || 0,
    totalSize: data.totalSize || 0,
    parentPath: data.parentPath || null,
    exists: data.exists || false,
    errorMessage: data.errorMessage || null,
  };
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createDirectoryDetails };
} else {
  window.DirectoryDetails = { createDirectoryDetails };
}
