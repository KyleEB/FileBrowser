/**
 * Home Directory Response Model
 * Utility functions for working with home directory responses
 */

/**
 * Create a HomeDirectoryResponse object from API response data
 * @param {Object} data - API response data
 * @returns {Object} HomeDirectoryResponse object
 */
function createHomeDirectoryResponse(data = {}) {
  return {
    path: data.path || "",
    exists: data.exists || false,
    errorMessage: data.errorMessage || null,
  };
}

/**
 * Create a success response
 * @param {string} path - Home directory path
 * @returns {Object} Success response object
 */
function createHomeDirectorySuccess(path) {
  return {
    path: path,
    exists: true,
    errorMessage: null,
  };
}

/**
 * Create a failure response
 * @param {string} path - Home directory path
 * @param {string} errorMessage - Error message
 * @returns {Object} Failure response object
 */
function createHomeDirectoryFailure(path, errorMessage) {
  return {
    path: path,
    exists: false,
    errorMessage: errorMessage,
  };
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createHomeDirectoryResponse,
    createHomeDirectorySuccess,
    createHomeDirectoryFailure,
  };
} else {
  window.HomeDirectoryResponse = {
    createHomeDirectoryResponse,
    createHomeDirectorySuccess,
    createHomeDirectoryFailure,
  };
}
