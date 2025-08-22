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
    this.bindNewFolderEvents();
    this.bindDragAndDropMoveEvents(); // Move this before file upload drag and drop
    this.bindDragAndDropEvents(); // Add this explicitly
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
      // Don't trigger click if we just finished dragging
      if (this.fileBrowser.isDragging) {
        return;
      }

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
      // Don't interfere with file item drag and drop
      if (e.target.closest(".file-item")) {
        return;
      }

      // Only handle if we have files being dragged (external files)
      if (e.originalEvent.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.addClass("drag-over");
      }
    });

    dropZone.on("dragleave dragend", (e) => {
      // Don't interfere with file item drag and drop
      if (e.target.closest(".file-item")) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      dropZone.removeClass("drag-over");
    });

    // Handle drop
    dropZone.on("drop", (e) => {
      // Don't interfere with file item drag and drop
      if (e.target.closest(".file-item")) {
        return;
      }

      // Only handle if we have files being dropped (external files)
      const files = e.originalEvent.dataTransfer.files;
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.removeClass("drag-over");
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

  /**
   * Bind new folder button events
   */
  bindNewFolderEvents() {
    this.fileBrowser.uiService.elements.newFolderBtn.on("click", () => {
      this.fileBrowser.createNewFolder();
    });
  }

  /**
   * Bind drag and drop events for moving files
   */
  bindDragAndDropMoveEvents() {
    console.log("Binding drag and drop events...");

    // Use native event listeners with capture phase for higher priority
    document.addEventListener(
      "dragstart",
      (e) => {
        const fileItem = e.target.closest(".file-item");
        if (fileItem) {
          console.log("Drag start event captured for file item");
          e.stopPropagation(); // Prevent other handlers from interfering
          this.fileBrowser.handleDragStart(e);
        }
      },
      true
    ); // Use capture phase

    document.addEventListener(
      "dragend",
      (e) => {
        const fileItem = e.target.closest(".file-item");
        if (fileItem) {
          e.stopPropagation();
          this.fileBrowser.handleDragEnd(e);
        }
      },
      true
    );

    document.addEventListener(
      "dragover",
      (e) => {
        const fileItem = e.target.closest(".file-item");
        if (fileItem) {
          e.stopPropagation();
          this.fileBrowser.handleDragOver(e);
        }
      },
      true
    );

    document.addEventListener(
      "dragleave",
      (e) => {
        const fileItem = e.target.closest(".file-item");
        if (fileItem) {
          e.stopPropagation();
          this.fileBrowser.handleDragLeave(e);
        }
      },
      true
    );

    document.addEventListener(
      "drop",
      (e) => {
        const fileItem = e.target.closest(".file-item");
        if (fileItem) {
          e.stopPropagation();
          this.fileBrowser.handleDrop(e);
        }
      },
      true
    );

    console.log("Drag and drop events bound successfully");
  }
}
