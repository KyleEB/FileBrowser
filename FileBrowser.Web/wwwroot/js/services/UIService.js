/**
 * UI Service - Handles all DOM manipulation and UI-related operations
 */
class UIService {
  constructor() {
    this.elements = {
      searchInput: $("#searchInput"),
      searchBtn: $("#searchBtn"),
      uploadBtn: $("#uploadBtn"),
      newFolderBtn: $("#newFolderBtn"),
      fileInput: $("#fileInput"),
      breadcrumbContainer: $("#breadcrumbContainer"),
      fileList: $("#fileList"),
      searchResults: $("#searchResults"),
      searchResultsList: $("#searchResultsList"),
      loadingIndicator: $("#loadingIndicator"),
      errorMessage: $("#errorMessage"),
      uploadProgress: $("#uploadProgress"),
      progressFill: $("#uploadProgress .progress-fill"),
      progressText: $("#uploadProgress .progress-text"),
      previewModal: $("#previewModal"),
      modalTitle: $("#modalTitle"),
      modalContent: $("#modalContent"),
      downloadBtn: $("#downloadBtn"),
      closeModalBtn: $("#closeModalBtn"),
      fileCountValue: $("#fileCountValue"),
      folderCountValue: $("#folderCountValue"),
      totalSizeValue: $("#totalSizeValue"),
    };
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.elements.loadingIndicator.show();
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.elements.loadingIndicator.hide();
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.elements.errorMessage.text(message).show();
  }

  /**
   * Show success message
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    // Create a temporary success message element
    const successElement = $(
      `<div class="success-message">${this.escapeHtml(message)}</div>`
    );
    this.elements.errorMessage.parent().append(successElement);

    setTimeout(() => {
      successElement.fadeOut(() => successElement.remove());
    }, 3000);
  }

  /**
   * Show upload progress
   */
  showUploadProgress() {
    this.elements.uploadProgress.show();
    this.elements.progressFill.css("width", "0%");
    this.elements.progressText.text("Uploading files...");

    // Disable upload button during upload
    this.elements.uploadBtn.prop("disabled", true).addClass("uploading");
  }

  /**
   * Update upload progress
   * @param {number} percent - Progress percentage (0-100)
   * @param {string} text - Progress text
   */
  updateUploadProgress(percent, text = null) {
    this.elements.progressFill.css("width", `${percent}%`);
    if (text) {
      this.elements.progressText.text(text);
    }
  }

  /**
   * Hide upload progress
   */
  hideUploadProgress() {
    this.elements.uploadProgress.hide();

    // Re-enable upload button after upload
    this.elements.uploadBtn.prop("disabled", false).removeClass("uploading");
  }

  /**
   * Hide error message
   */
  hideError() {
    this.elements.errorMessage.hide();
  }

  /**
   * Hide search results
   */
  hideSearchResults() {
    this.elements.searchResults.hide();
  }

  /**
   * Update breadcrumb navigation
   * @param {string} path - Current path
   * @param {string} additionalText - Additional text to display
   */
  updateBreadcrumb(path, additionalText = "") {
    this.elements.breadcrumbContainer.empty();

    const pathParts = path.split("/").filter((part) => part.length > 0);
    let currentPath = "";

    // Add home
    this.elements.breadcrumbContainer.append(
      '<span class="breadcrumb-item" data-path="">Home</span>'
    );

    // Add path parts
    pathParts.forEach((part, index) => {
      currentPath += (currentPath ? "/" : "") + part;
      this.elements.breadcrumbContainer.append(
        `<span class="breadcrumb-item" data-path="${currentPath}">${part}</span>`
      );
    });

    if (additionalText) {
      this.elements.breadcrumbContainer.append(
        `<span class="text-muted">${additionalText}</span>`
      );
    }
  }

  /**
   * Update statistics display
   * @param {number} fileCount - Number of files
   * @param {number} directoryCount - Number of directories
   * @param {number} totalSize - Total size in bytes
   */
  updateStats(fileCount, directoryCount, totalSize) {
    this.elements.fileCountValue.text(fileCount);
    this.elements.folderCountValue.text(directoryCount);
    this.elements.totalSizeValue.text(this.formatFileSize(totalSize));
  }

  /**
   * Render file list
   * @param {Array} items - Array of file system items
   * @param {string} currentPath - Current directory path
   */
  renderFileList(items, currentPath = "") {
    this.elements.fileList.empty();

    // Add parent directory item if we're in a subdirectory
    if (currentPath && currentPath !== "") {
      const parentItem = this.createParentDirectoryItem(currentPath);
      this.elements.fileList.append(parentItem);
    }

    if (items.length === 0) {
      this.elements.fileList.html(
        '<div class="text-center text-muted">This directory is empty.</div>'
      );
      $("#dragDropHelp").hide();
      return;
    }

    items.forEach((item) => {
      const fileItem = this.createFileItemHtml(item);
      this.elements.fileList.append(fileItem);
    });

    // Show drag and drop help when there are items
    $("#dragDropHelp").show();
  }

  /**
   * Display search results
   * @param {Array} results - Search results
   * @param {string} query - Search query
   */
  displaySearchResults(results, query) {
    this.updateStats(results.length, 0, 0);

    this.elements.searchResults.show();
    this.elements.searchResultsList.empty();

    if (results.length === 0) {
      this.elements.searchResultsList.html(
        '<div class="text-center text-muted">No files found matching your search.</div>'
      );
      return;
    }

    results.forEach((item) => {
      const fileItem = this.createFileItemHtml(item);
      this.elements.searchResultsList.append(fileItem);
    });
  }

  /**
   * Create HTML for a file item
   * @param {Object} item - File system item
   * @returns {string} HTML string
   */
  createFileItemHtml(item) {
    // Use the model's properties for type checking
    const icon = item.isDirectory ? "fa-folder" : "fa-file";
    const iconClass = item.isDirectory ? "folder" : "file";
    const size = item.size ? this.formatFileSize(item.size) : "";
    const modified = item.lastModified
      ? new Date(item.lastModified).toLocaleDateString()
      : "";

    const details = [];
    if (size) details.push(size);
    if (modified) details.push(modified);
    if (item.extension) details.push(item.extension);

    const detailsHtml =
      details.length > 0
        ? `<div class="file-details">${details.join(" • ")}</div>`
        : "";

    const actions = [];

    // Add download button for files
    if (item.isFile) {
      actions.push(
        `<button class="btn btn-primary download-btn" data-path="${item.path}">Download</button>`
      );
    }

    // Add delete button for all items (except parent directory)
    actions.push(
      `<button class="btn btn-danger delete-btn" data-path="${
        item.path
      }" data-name="${this.escapeHtml(item.name)}" data-is-directory="${
        item.isDirectory
      }">Delete</button>`
    );

    const actionsHtml = actions.join("");

    return `
            <div class="file-item" data-path="${item.path}" data-is-directory="${
      item.isDirectory
    }" draggable="true" data-item-name="${this.escapeHtml(item.name)}">
                <div class="file-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(item.name)}</div>
                    ${detailsHtml}
                </div>
                <div class="file-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;
  }

  /**
   * Create HTML for parent directory item
   * @param {string} currentPath - Current directory path
   * @returns {string} HTML string
   */
  createParentDirectoryItem(currentPath) {
    // Calculate parent path
    const pathParts = currentPath.split("/").filter((part) => part.length > 0);
    const parentPath = pathParts.slice(0, -1).join("/");

    console.log("Parent directory calculation:", {
      currentPath,
      pathParts,
      parentPath,
    });

    return `
            <div class="file-item parent-directory" data-path="${parentPath}" data-is-directory="true" draggable="true" data-item-name="..">
                <div class="file-icon folder">
                    <i class="fas fa-level-up-alt"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">.. (Parent Directory)</div>
                    <div class="file-details">Go to parent directory</div>
                </div>
                <div class="file-actions">
                    <!-- No delete button for parent directory -->
                </div>
            </div>
        `;
  }

  /**
   * Show file preview modal
   * @param {Object} previewInfo - File preview information
   */
  showFilePreview(previewInfo) {
    this.elements.modalTitle.text(`Preview: ${previewInfo.fileName}`);
    this.elements.downloadBtn.data("path", previewInfo.filePath);

    if (previewInfo.type === "text") {
      this.elements.modalContent.html(
        `<div class="file-preview">${this.escapeHtml(
          previewInfo.content
        )}</div>`
      );
    } else {
      this.elements.modalContent.html(`
                <div class="text-center">
                    <i class="fas fa-file fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Preview not available for this file type.</p>
                    <p class="text-muted">File size: ${this.formatFileSize(
                      previewInfo.size
                    )}</p>
                </div>
            `);
    }

    this.elements.previewModal.show();
  }

  /**
   * Close modal
   */
  closeModal() {
    this.elements.previewModal.hide();
    this.elements.downloadBtn.removeData("path");
  }

  /**
   * Set search input value
   * @param {string} value - Value to set
   */
  setSearchValue(value) {
    this.elements.searchInput.val(value);
  }

  /**
   * Get search input value
   * @returns {string} Current search value
   */
  getSearchValue() {
    return this.elements.searchInput.val().trim();
  }

  /**
   * Clear file input
   */
  clearFileInput() {
    this.elements.fileInput.val("");
  }

  /**
   * Format file size in human readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
