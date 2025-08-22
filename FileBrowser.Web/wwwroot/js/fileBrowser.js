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

            const searchRequest = {
                query: query,
                path: this.navigationService.getCurrentPath(),
                includeSubdirectories: true,
                searchInFileNames: true,
                searchInFileContents: false,
                maxResults: 100
            };

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
     * @param {Object} data - Directory data from API
     */
    displayDirectory(data) {
        if (!data.exists) {
            this.uiService.showError(data.errorMessage || 'Directory not found');
            return;
        }

        this.uiService.updateBreadcrumb(data.path);
        this.uiService.updateStats(data.fileCount, data.directoryCount, data.totalSize);
        this.uiService.renderFileList(data.items);
    }

    /**
     * Display search results
     * @param {Array} results - Search results
     * @param {string} query - Search query
     */
    displaySearchResults(results, query) {
        this.uiService.updateBreadcrumb(this.navigationService.getCurrentPath(), `Search: "${query}"`);
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
            const fileName = filePath.split('/').pop();
            
            const link = document.createElement('a');
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
        const file = event.target.files[0];
        if (!file) return;

        try {
            await this.fileSystemService.uploadFile(file, this.navigationService.getCurrentPath());
            
            // Refresh the current directory
            this.navigateToPath(this.navigationService.getCurrentPath());
            
            // Clear the file input
            this.uiService.clearFileInput();
        } catch (error) {
            this.uiService.showError(error.message);
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
            isSearchMode: this.navigationService.isInSearchMode()
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
        this.navigateToPath('');
    }

    /**
     * Clear search and return to directory view
     */
    clearSearch() {
        this.navigationService.clearSearchMode();
        this.uiService.setSearchValue('');
        this.navigateToPath(this.navigationService.getCurrentPath());
    }
}

// Initialize the application when the document is ready
$(document).ready(() => {
    window.fileBrowser = new FileBrowser();
});
