/**
 * Home Directory Response Model
 * Matches the backend HomeDirectoryResponse contract
 */
class HomeDirectoryResponse {
  constructor(data = {}) {
    this.path = data.path || "";
    this.exists = data.exists || false;
    this.errorMessage = data.errorMessage || null;
  }

  /**
   * Create a HomeDirectoryResponse from API response data
   * @param {Object} data - API response data
   * @returns {HomeDirectoryResponse} New HomeDirectoryResponse instance
   */
  static fromApiResponse(data) {
    return new HomeDirectoryResponse({
      path: data.path,
      exists: data.exists,
      errorMessage: data.errorMessage,
    });
  }

  /**
   * Create a success response
   * @param {string} path - Home directory path
   * @returns {HomeDirectoryResponse} Success response
   */
  static createSuccess(path) {
    return new HomeDirectoryResponse({
      path: path,
      exists: true,
      errorMessage: null,
    });
  }

  /**
   * Create a failure response
   * @param {string} path - Home directory path
   * @param {string} errorMessage - Error message
   * @returns {HomeDirectoryResponse} Failure response
   */
  static createFailure(path, errorMessage) {
    return new HomeDirectoryResponse({
      path: path,
      exists: false,
      errorMessage: errorMessage,
    });
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = HomeDirectoryResponse;
} else {
  window.HomeDirectoryResponse = HomeDirectoryResponse;
}
