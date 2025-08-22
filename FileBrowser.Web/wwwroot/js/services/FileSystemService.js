/**
 * File System Service - Handles all file system operations and API communication
 */
class FileSystemService {
  constructor() {
    this.apiBaseUrl = window.config?.api?.baseUrl;
  }

  /**
   * Browse a directory
   * @param {string} path - Directory path to browse
   * @returns {Promise<DirectoryDetails>} Directory information
   */
  async browseDirectory(path = "") {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/browse?path=${encodeURIComponent(path)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return DirectoryDetails.fromApiResponse(data);
    } catch (error) {
      throw new Error(`Failed to browse directory: ${error.message}`);
    }
  }

  /**
   * Search for files and directories
   * @param {SearchRequest} searchRequest - Search criteria
   * @returns {Promise<Array<FileSystemItem>>} Search results
   */
  async searchFiles(searchRequest) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchRequest.toApiRequest()),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item) => FileSystemItem.fromApiResponse(item));
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Download a file
   * @param {string} filePath - Path to the file to download
   * @returns {Promise<Blob>} File blob
   */
  async downloadFile(filePath) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/download?path=${encodeURIComponent(filePath)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Upload a file
   * @param {File} file - File to upload
   * @param {string} targetPath - Target directory path
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<UploadResponse>} Upload result
   */
  async uploadFile(file, targetPath = "", onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(UploadResponse.fromApiResponse(data));
            } catch (error) {
              resolve(UploadResponse.createSuccess("", 0));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open(
          "POST",
          `${this.apiBaseUrl}/upload?path=${encodeURIComponent(targetPath)}`
        );
        xhr.send(formData);
      });
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Get home directory information
   * @returns {Promise<HomeDirectoryResponse>} Home directory info
   */
  async getHomeDirectory() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/home`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return HomeDirectoryResponse.fromApiResponse(data);
    } catch (error) {
      throw new Error(`Failed to get home directory: ${error.message}`);
    }
  }

  /**
   * Preview a file (download and return as text for text files)
   * @param {string} filePath - Path to the file to preview
   * @returns {Promise<Object>} File preview information
   */
  async previewFile(filePath) {
    try {
      const blob = await this.downloadFile(filePath);
      const fileName = filePath.split("/").pop();

      // Check if it's a text file
      const textExtensions = [
        ".txt",
        ".md",
        ".json",
        ".xml",
        ".html",
        ".css",
        ".js",
        ".cs",
        ".py",
        ".java",
        ".cpp",
        ".h",
        ".log",
      ];
      const extension = fileName
        .substring(fileName.lastIndexOf("."))
        .toLowerCase();

      if (textExtensions.includes(extension)) {
        const text = await blob.text();
        return {
          type: "text",
          content: text,
          fileName: fileName,
          size: blob.size,
        };
      } else {
        return {
          type: "binary",
          fileName: fileName,
          size: blob.size,
        };
      }
    } catch (error) {
      throw new Error(`Preview failed: ${error.message}`);
    }
  }
}
