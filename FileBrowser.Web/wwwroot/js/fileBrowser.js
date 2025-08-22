/**
 * Main FileBrowser Application - Orchestrates all services and provides public API
 */
class FileBrowser {
  constructor() {
    // Initialize services
    this.fileSystemService = new FileSystemService();
    this.uiService = new UIService();
    this.navigationService = new NavigationService();
    this.eventService = new EventService(this);

    // Drag and drop state
    this.isDragging = false;

    // Initialize application
    this.initialize();
  }

  /**
   * Initialize the application
   */
  initialize() {
    // Load initial state from URL
    const initialState = this.navigationService.loadFromUrl();

    // Set up event listeners
    this.eventService.initializeEventListeners();
    this.eventService.bindKeyboardShortcuts();
    this.eventService.bindDragAndDropEvents();
    this.eventService.bindContextMenuEvents();

    // Load initial content
    if (initialState.isSearchMode) {
      this.uiService.setSearchValue(initialState.search);
      this.performSearch();
    } else {
      this.navigateToPath(initialState.path);
    }
  }

  /**
   * Navigate to a specific directory path
   * @param {string} path - Directory path to navigate to
   */
  async navigateToPath(path) {
    try {
      this.navigationService.navigateToPath(path);
      this.uiService.showLoading();
      this.uiService.hideError();
      this.uiService.hideSearchResults();

      const data = await this.fileSystemService.browseDirectory(path);
      this.displayDirectory(data);
    } catch (error) {
      this.uiService.showError(error.message);
    } finally {
      this.uiService.hideLoading();
    }
  }

  /**
   * Perform search operation
   */
  async performSearch() {
    const query = this.uiService.getSearchValue();

    if (!query) {
      this.navigateToPath(this.navigationService.getCurrentPath());
      return;
    }

    try {
      this.navigationService.setSearchMode(query);
      this.uiService.showLoading();
      this.uiService.hideError();

      const searchRequest = new SearchRequest({
        query: query,
        path: this.navigationService.getCurrentPath(),
        includeSubdirectories: true,
        searchInFileNames: true,
        searchInFileContents: false,
        maxResults: 100,
      });

      const results = await this.fileSystemService.searchFiles(searchRequest);
      this.displaySearchResults(results, query);
    } catch (error) {
      this.uiService.showError(error.message);
    } finally {
      this.uiService.hideLoading();
    }
  }

  /**
   * Display directory information
   * @param {DirectoryDetails} data - Directory data from API
   */
  displayDirectory(data) {
    if (!data.exists) {
      this.uiService.showError(data.errorMessage || "Directory not found");
      return;
    }

    this.uiService.updateBreadcrumb(data.path);
    this.uiService.updateStats(
      data.fileCount,
      data.directoryCount,
      data.totalSize
    );
    this.uiService.renderFileList(data.items);
  }

  /**
   * Display search results
   * @param {Array<FileSystemItem>} results - Search results
   * @param {string} query - Search query
   */
  displaySearchResults(results, query) {
    this.uiService.updateBreadcrumb(
      this.navigationService.getCurrentPath(),
      `Search: "${query}"`
    );
    this.uiService.displaySearchResults(results, query);
  }

  /**
   * Show file preview
   * @param {string} filePath - Path to the file to preview
   */
  async showFilePreview(filePath) {
    try {
      const previewInfo = await this.fileSystemService.previewFile(filePath);
      previewInfo.filePath = filePath; // Add file path for download button
      this.uiService.showFilePreview(previewInfo);
    } catch (error) {
      this.uiService.showError(error.message);
    }
  }

  /**
   * Download a file
   * @param {string} filePath - Path to the file to download
   */
  async downloadFile(filePath) {
    try {
      const blob = await this.fileSystemService.downloadFile(filePath);
      const fileName = filePath.split("/").pop();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      this.uiService.showError(error.message);
    }
  }

  /**
   * Handle file upload
   * @param {Event} event - File input change event
   */
  async handleFileUpload(event) {
    console.log("handleFileUpload called", event);
    const files = Array.from(event.target.files);
    console.log("Files selected:", files);
    if (files.length === 0) return;

    // Validate file sizes
    const maxFileSize = config.app.maxFileSize || 100 * 1024 * 1024; // 100MB default
    const oversizedFiles = files.filter((file) => file.size > maxFileSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      this.uiService.showError(
        `Files too large: ${fileNames}. Maximum size is ${this.formatFileSize(
          maxFileSize
        )}`
      );
      this.uiService.clearFileInput();
      return;
    }

    await this.handleMultipleFileUpload(files);
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
   * Handle multiple file uploads
   * @param {FileList|Array} files - Files to upload
   */
  async handleMultipleFileUpload(files) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    this.uiService.showUploadProgress();

    try {
      let completedUploads = 0;
      const totalUploads = fileArray.length;

      const uploadPromises = fileArray.map((file, index) =>
        this.fileSystemService
          .uploadFile(
            file,
            this.navigationService.getCurrentPath(),
            (progress) => {
              // Update progress for individual file
              const overallProgress =
                ((completedUploads + progress / 100) / totalUploads) * 100;
              this.uiService.updateUploadProgress(
                overallProgress,
                `Uploading ${file.name} (${
                  completedUploads + 1
                }/${totalUploads})`
              );
            }
          )
          .then(() => {
            completedUploads++;
            const overallProgress = (completedUploads / totalUploads) * 100;
            this.uiService.updateUploadProgress(
              overallProgress,
              `Uploaded ${completedUploads}/${totalUploads} files`
            );
          })
      );

      await Promise.all(uploadPromises);

      // Refresh the current directory
      this.navigateToPath(this.navigationService.getCurrentPath());

      // Clear the file input
      this.uiService.clearFileInput();

      // Show success message
      this.uiService.showSuccess(
        `${fileArray.length} file(s) uploaded successfully`
      );
    } catch (error) {
      this.uiService.showError(`Upload failed: ${error.message}`);
    } finally {
      this.uiService.hideUploadProgress();
    }
  }

  /**
   * Get current application state
   * @returns {Object} Current state
   */
  getCurrentState() {
    return {
      path: this.navigationService.getCurrentPath(),
      search: this.navigationService.getCurrentSearchQuery(),
      isSearchMode: this.navigationService.isInSearchMode(),
    };
  }

  /**
   * Get shareable URL for current state
   * @returns {string} Shareable URL
   */
  getShareableUrl() {
    return this.navigationService.getShareableUrl();
  }

  /**
   * Refresh current view
   */
  refresh() {
    if (this.navigationService.isInSearchMode()) {
      this.performSearch();
    } else {
      this.navigateToPath(this.navigationService.getCurrentPath());
    }
  }

  /**
   * Go to parent directory
   */
  goToParent() {
    const parentPath = this.navigationService.getParentPath(
      this.navigationService.getCurrentPath()
    );
    this.navigateToPath(parentPath);
  }

  /**
   * Go to home directory
   */
  goToHome() {
    this.navigateToPath("");
  }

  /**
   * Clear search and return to directory view
   */
  clearSearch() {
    this.navigationService.clearSearchMode();
    this.uiService.setSearchValue("");
    this.navigateToPath(this.navigationService.getCurrentPath());
  }

  /**
   * Create a new folder
   */
  async createNewFolder() {
    const folderName = prompt("Enter folder name:");
    if (!folderName || folderName.trim() === "") {
      return;
    }

    const trimmedName = folderName.trim();

    // Basic validation
    if (trimmedName.includes("/") || trimmedName.includes("\\")) {
      this.uiService.showError("Folder name cannot contain slashes");
      return;
    }

    try {
      this.uiService.showLoading();
      await this.fileSystemService.createDirectory(
        trimmedName,
        this.navigationService.getCurrentPath()
      );

      // Refresh the current directory
      this.navigateToPath(this.navigationService.getCurrentPath());
      this.uiService.showSuccess(
        `Folder "${trimmedName}" created successfully`
      );
    } catch (error) {
      this.uiService.showError(error.message);
    } finally {
      this.uiService.hideLoading();
    }
  }

  /**
   * Handle drag start event
   * @param {DragEvent} event - Drag event
   */
  handleDragStart(event) {
    console.log("Drag start detected!"); // Keep this for debugging
    this.isDragging = true;

    const fileItem = event.target.closest(".file-item");
    if (!fileItem) {
      console.log("No file-item found in drag start");
      return;
    }

    const path = fileItem.dataset.path;
    const name = fileItem.dataset.itemName;
    const type = fileItem.dataset.type;

    console.log("Dragging item:", { path, name, type });

    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        path: path,
        name: name,
        type: fileItem.dataset.type,
      })
    );

    event.dataTransfer.effectAllowed = "move";
    fileItem.classList.add("dragging");

    // Show a temporary message that drag is working
    this.uiService.showSuccess(`Moving: ${name}`);

    // Add a visual indicator to the page
    const indicator = document.createElement("div");
    indicator.id = "drag-indicator";
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #007bff;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    indicator.textContent = `Moving: ${name}`;
    document.body.appendChild(indicator);
  }

  /**
   * Handle drag end event
   * @param {DragEvent} event - Drag event
   */
  handleDragEnd(event) {
    console.log("Drag end event triggered");
    this.isDragging = false;

    const fileItem = event.target.closest(".file-item");
    if (fileItem) {
      fileItem.classList.remove("dragging");
    }

    // Remove the visual indicator
    const indicator = document.getElementById("drag-indicator");
    if (indicator) {
      indicator.remove();
    }

    // Clear the dragging flag after a short delay to prevent click events
    setTimeout(() => {
      this.isDragging = false;
    }, 100);
  }

  /**
   * Handle drag over event
   * @param {DragEvent} event - Drag event
   */
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const targetItem = event.target.closest(".file-item");
    if (targetItem && targetItem.dataset.type === "1") {
      targetItem.classList.add("drag-over");
    }
  }

  /**
   * Handle drag leave event
   * @param {DragEvent} event - Drag event
   */
  handleDragLeave(event) {
    const targetItem = event.target.closest(".file-item");
    if (targetItem) {
      targetItem.classList.remove("drag-over");
    }
  }

  /**
   * Handle drop event
   * @param {DragEvent} event - Drag event
   */
  async handleDrop(event) {
    event.preventDefault();

    const targetItem = event.target.closest(".file-item");
    if (!targetItem || targetItem.dataset.type !== "1") {
      return;
    }

    targetItem.classList.remove("drag-over");

    try {
      const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));

      const sourcePath = dragData.path;
      const targetPath = targetItem.dataset.path;
      const fileName = dragData.name;

      // Calculate destination path
      const destinationPath = targetPath + "/" + fileName;

      // Confirm the move operation
      const confirmed = confirm(
        `Move "${fileName}" to "${targetItem.dataset.itemName}"?`
      );
      if (!confirmed) {
        return;
      }

      this.uiService.showLoading();
      await this.fileSystemService.moveItem(sourcePath, destinationPath);

      // Refresh the current directory
      this.navigateToPath(this.navigationService.getCurrentPath());
      this.uiService.showSuccess(`"${fileName}" moved successfully`);
    } catch (error) {
      console.error("Move failed:", error);
      this.uiService.showError(error.message);
    } finally {
      this.uiService.hideLoading();
    }
  }
}

// Initialize the application when the document is ready
$(document).ready(() => {
  window.fileBrowser = new FileBrowser();
});
