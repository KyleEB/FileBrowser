/**
 * File System Item Type Enum
 * Matches the backend FileSystemItemType contract
 */
const FileSystemItemType = {
  File: 0,
  Directory: 1,
};

// Freeze the object to prevent modifications
Object.freeze(FileSystemItemType);

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FileSystemItemType;
} else {
  window.FileSystemItemType = FileSystemItemType;
}
