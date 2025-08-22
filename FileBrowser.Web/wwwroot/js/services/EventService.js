/**
 * Event Service - Handles all event binding and user interactions
 */
class EventService {
  constructor(fileBrowser) {
    this.fileBrowser = fileBrowser;
  }

  /**
   * Initialize all event listeners
   */
  initializeEventListeners() {
    this.bindSearchEvents();
    this.bindFileUploadEvents();
    this.bindModalEvents();
    this.bindNavigationEvents();
    this.bindFileItemEvents();
    this.bindDownloadEvents();
  }

  /**
   * Bind search-related events
   */
  bindSearchEvents() {
    // Search input keypress (Enter key)
    this.fileBrowser.uiService.elements.searchInput.on("keypress", (e) => {
      if (e.which === 13) {
        this.fileBrowser.performSearch();
      }
    });

    // Search button click
    this.fileBrowser.uiService.elements.searchBtn.on("click", () => {
      this.fileBrowser.performSearch();
    });
  }

  /**
   * Bind file upload events
   */
  bindFileUploadEvents() {
    // Use native JavaScript for better compatibility with file input
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");

    if (uploadBtn && fileInput) {
      console.log("Found upload button and file input elements");

      // Upload button click
      uploadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Upload button clicked");

        // Trigger the file input click
        fileInput.click();
      });

      // File input change
      fileInput.addEventListener("change", (e) => {
        console.log("File input change event triggered", e.target.files);
        this.fileBrowser.handleFileUpload(e);
      });
    } else {
      console.error("Upload button or file input not found", {
        uploadBtn,
        fileInput,
      });
    }

    // Add drag and drop support for the content area
    const contentArea = this.fileBrowser.uiService.elements.fileList.parent();

    contentArea.on("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      contentArea.addClass("drag-over");
    });

    contentArea.on("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!contentArea.has(e.relatedTarget).length) {
        contentArea.removeClass("drag-over");
      }
    });

    contentArea.on("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      contentArea.removeClass("drag-over");

      const files = e.originalEvent.dataTransfer.files;
      if (files.length > 0) {
        this.fileBrowser.handleMultipleFileUpload(files);
      }
    });
  }

  /**
   * Bind modal events
   */
  bindModalEvents() {
    // Close modal buttons
    $(".close, #closeModalBtn").on("click", () => {
      this.fileBrowser.uiService.closeModal();
    });

    // Click outside modal to close
    $(window).on("click", (e) => {
      if ($(e.target).hasClass("modal")) {
        this.fileBrowser.uiService.closeModal();
      }
    });
  }

  /**
   * Bind navigation events
   */
  bindNavigationEvents() {
    // Breadcrumb navigation
    $(document).on("click", ".breadcrumb-item", (e) => {
      const path = $(e.target).data("path") || "";
      this.fileBrowser.navigateToPath(path);
    });
  }

  /**
   * Bind file item events
   */
  bindFileItemEvents() {
    // File item click (navigation or preview)
    $(document).on("click", ".file-item", (e) => {
      if (!$(e.target).hasClass("btn")) {
        const path = $(e.currentTarget).data("path");
        const type = $(e.currentTarget).data("type");

        // Use the model's properties for type checking
        if (type === FileSystemItemType.Directory) {
          this.fileBrowser.navigateToPath(path);
        } else {
          this.fileBrowser.showFilePreview(path);
        }
      }
    });
  }

  /**
   * Bind download events
   */
  bindDownloadEvents() {
    // Download button in file list
    $(document).on("click", ".download-btn", (e) => {
      e.stopPropagation();
      const path = $(e.currentTarget).data("path");
      this.fileBrowser.downloadFile(path);
    });

    // Download button in modal
    $("#downloadBtn").on("click", () => {
      const path = $("#downloadBtn").data("path");
      if (path) {
        this.fileBrowser.downloadFile(path);
      }
    });
  }

  /**
   * Bind keyboard shortcuts
   */
  bindKeyboardShortcuts() {
    $(document).on("keydown", (e) => {
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        this.fileBrowser.uiService.elements.searchInput.focus();
      }

      // Escape: Close modal
      if (e.key === "Escape") {
        this.fileBrowser.uiService.closeModal();
      }

      // Backspace: Go to parent directory (when not in input)
      if (e.key === "Backspace" && !this.isInInput(e.target)) {
        e.preventDefault();
        const parentPath = this.fileBrowser.navigationService.getParentPath(
          this.fileBrowser.navigationService.getCurrentPath()
        );
        this.fileBrowser.navigateToPath(parentPath);
      }
    });
  }

  /**
   * Check if element is an input field
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is an input
   */
  isInInput(element) {
    const tagName = element.tagName.toLowerCase();
    return (
      tagName === "input" ||
      tagName === "textarea" ||
      element.contentEditable === "true"
    );
  }

  /**
   * Bind drag and drop events for file upload
   */
  bindDragAndDropEvents() {
    const dropZone = $(".content-area");

    // Prevent default drag behaviors
    dropZone.on("dragover dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.addClass("drag-over");
    });

    dropZone.on("dragleave dragend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.removeClass("drag-over");
    });

    // Handle drop
    dropZone.on("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.removeClass("drag-over");

      const files = e.originalEvent.dataTransfer.files;
      if (files.length > 0) {
        this.fileBrowser.handleFileUpload({ target: { files: files } });
      }
    });
  }

  /**
   * Bind context menu events
   */
  bindContextMenuEvents() {
    $(document).on("contextmenu", ".file-item", (e) => {
      e.preventDefault();
      const path = $(e.currentTarget).data("path");
      const type = $(e.currentTarget).data("type");

      // Show context menu with options
      this.showContextMenu(e, path, type);
    });

    // Hide context menu when clicking elsewhere
    $(document).on("click", () => {
      $(".context-menu").remove();
    });
  }

  /**
   * Show context menu for file items
   * @param {Event} e - Mouse event
   * @param {string} path - File path
   * @param {string} type - File type
   */
  showContextMenu(e, path, type) {
    // Remove existing context menus
    $(".context-menu").remove();

    const menu = $('<div class="context-menu"></div>');
    const fileName = path.split("/").pop();

    menu.append(`<div class="context-menu-item">${fileName}</div>`);
    menu.append('<div class="context-menu-separator"></div>');

    // Use the model's enum for type checking
    if (type === FileSystemItemType.File) {
      menu.append(
        '<div class="context-menu-item" data-action="download">Download</div>'
      );
      menu.append(
        '<div class="context-menu-item" data-action="preview">Preview</div>'
      );
    } else {
      menu.append(
        '<div class="context-menu-item" data-action="open">Open</div>'
      );
    }

    menu.append('<div class="context-menu-separator"></div>');
    menu.append(
      '<div class="context-menu-item" data-action="copy-path">Copy Path</div>'
    );

    // Position menu
    menu.css({
      position: "absolute",
      left: e.pageX,
      top: e.pageY,
      zIndex: 1000,
    });

    $("body").append(menu);

    // Handle context menu clicks
    menu.on("click", ".context-menu-item", (e) => {
      const action = $(e.target).data("action");
      this.handleContextMenuAction(action, path, type);
      menu.remove();
    });
  }

  /**
   * Handle context menu actions
   * @param {string} action - Action to perform
   * @param {string} path - File path
   * @param {string} type - File type
   */
  handleContextMenuAction(action, path, type) {
    switch (action) {
      case "download":
        this.fileBrowser.downloadFile(path);
        break;
      case "preview":
        this.fileBrowser.showFilePreview(path);
        break;
      case "open":
        this.fileBrowser.navigateToPath(path);
        break;
      case "copy-path":
        navigator.clipboard.writeText(path);
        break;
    }
  }
}
