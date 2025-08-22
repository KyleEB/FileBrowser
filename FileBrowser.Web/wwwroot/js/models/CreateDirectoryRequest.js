/**
 * Create Directory Request Model
 */
class CreateDirectoryRequest {
    constructor(name, parentPath = null) {
        this.name = name;
        this.parentPath = parentPath;
    }

    /**
     * Convert to API request format
     * @returns {Object} API request object
     */
    toApiRequest() {
        return {
            name: this.name,
            parentPath: this.parentPath
        };
    }

    /**
     * Create from API response
     * @param {Object} data - API response data
     * @returns {CreateDirectoryRequest} CreateDirectoryRequest instance
     */
    static fromApiRequest(data) {
        return new CreateDirectoryRequest(data.name, data.parentPath);
    }
}
