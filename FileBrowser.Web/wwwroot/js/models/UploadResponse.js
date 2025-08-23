/**
 * Upload Response Model
 * Utility functions for working with upload responses
 */

/**
 * Create an UploadResponse object from API response data
 * @param {Object} data - API response data
 * @returns {Object} UploadResponse object
 */
function createUploadResponse(data = {}) {
  return {
    success: data.success || false,
    message: data.message || "",
    filePath: data.filePath || null,
    fileSize: data.fileSize || 0,
  };
}

/**
 * Create a success response
 * @param {string} filePath - Path of the uploaded file
 * @param {number} fileSize - Size of the uploaded file
 * @returns {Object} Success response object
 */
function createUploadSuccess(filePath, fileSize) {
  return {
    success: true,
    message: "File uploaded successfully",
    filePath: filePath,
    fileSize: fileSize,
  };
}

/**
 * Create a failure response
 * @param {string} message - Error message
 * @returns {Object} Failure response object
 */
function createUploadFailure(message) {
  return {
    success: false,
    message: message,
    filePath: null,
    fileSize: 0,
  };
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createUploadResponse,
    createUploadSuccess,
    createUploadFailure,
  };
} else {
  window.UploadResponse = {
    createUploadResponse,
    createUploadSuccess,
    createUploadFailure,
  };
}
