/**
 * Move Request Model
 */
class MoveRequest {
  constructor(sourcePath, destinationPath) {
    this.sourcePath = sourcePath;
    this.destinationPath = destinationPath;
  }

  /**
   * Convert to API request format
   * @returns {Object} API request object
   */
  toApiRequest() {
    return {
      sourcePath: this.sourcePath,
      destinationPath: this.destinationPath,
    };
  }

  /**
   * Create from API response
   * @param {Object} data - API response data
   * @returns {MoveRequest} MoveRequest instance
   */
  static fromApiRequest(data) {
    return new MoveRequest(data.sourcePath, data.destinationPath);
  }
}
