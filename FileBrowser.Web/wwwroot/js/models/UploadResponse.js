/**
 * Upload Response Model
 * Matches the backend UploadResponse contract
 */
class UploadResponse {
  constructor(data = {}) {
    this.success = data.success || false;
    this.message = data.message || "";
    this.filePath = data.filePath || null;
    this.fileSize = data.fileSize || 0;
  }

  /**
   * Create an UploadResponse from API response data
   * @param {Object} data - API response data
   * @returns {UploadResponse} New UploadResponse instance
   */
  static fromApiResponse(data) {
    return new UploadResponse({
      success: data.success,
      message: data.message,
      filePath: data.filePath,
      fileSize: data.fileSize,
    });
  }

  /**
   * Create a success response
   * @param {string} filePath - Path of the uploaded file
   * @param {number} fileSize - Size of the uploaded file
   * @returns {UploadResponse} Success response
   */
  static createSuccess(filePath, fileSize) {
    return new UploadResponse({
      success: true,
      message: "File uploaded successfully",
      filePath: filePath,
      fileSize: fileSize,
    });
  }

  /**
   * Create a failure response
   * @param {string} message - Error message
   * @returns {UploadResponse} Failure response
   */
  static createFailure(message) {
    return new UploadResponse({
      success: false,
      message: message,
      filePath: null,
      fileSize: 0,
    });
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = UploadResponse;
} else {
  window.UploadResponse = UploadResponse;
}
