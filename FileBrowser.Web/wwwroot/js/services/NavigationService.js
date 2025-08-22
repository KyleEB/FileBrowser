/**
 * Navigation Service - Handles URL management and deep linking
 */
class NavigationService {
  constructor() {
    this.currentPath = "";
    this.currentSearchQuery = "";
    this.isSearchMode = false;
  }

  /**
   * Load state from URL parameters
   * @returns {Object} Navigation state
   */
  loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get("path") || "";
    const search = urlParams.get("search") || "";

    this.currentPath = path;
    this.currentSearchQuery = search;
    this.isSearchMode = !!search;

    return {
      path: path,
      search: search,
      isSearchMode: this.isSearchMode,
    };
  }

  /**
   * Update URL with current state
   * @param {string} path - Directory path
   * @param {string} search - Search query
   */
  updateUrl(path = null, search = null) {
    const url = new URL(window.location);

    if (path !== null) {
      if (path === "") {
        url.searchParams.delete("path");
      } else {
        url.searchParams.set("path", path);
      }
    }

    if (search !== null) {
      if (search === "") {
        url.searchParams.delete("search");
      } else {
        url.searchParams.set("search", search);
      }
    }

    window.history.pushState({}, "", url);
  }

  /**
   * Navigate to a specific path
   * @param {string} path - Directory path to navigate to
   */
  navigateToPath(path) {
    this.currentPath = path;
    this.isSearchMode = false;
    this.updateUrl(path, "");
  }

  /**
   * Set search mode
   * @param {string} query - Search query
   */
  setSearchMode(query) {
    this.currentSearchQuery = query;
    this.isSearchMode = true;
    this.updateUrl(this.currentPath, query);
  }

  /**
   * Clear search mode
   */
  clearSearchMode() {
    this.currentSearchQuery = "";
    this.isSearchMode = false;
    this.updateUrl(this.currentPath, "");
  }

  /**
   * Get current path
   * @returns {string} Current directory path
   */
  getCurrentPath() {
    return this.currentPath;
  }

  /**
   * Get current search query
   * @returns {string} Current search query
   */
  getCurrentSearchQuery() {
    return this.currentSearchQuery;
  }

  /**
   * Check if currently in search mode
   * @returns {boolean} True if in search mode
   */
  isInSearchMode() {
    return this.isSearchMode;
  }

  /**
   * Create a shareable URL for current state
   * @returns {string} Shareable URL
   */
  getShareableUrl() {
    const url = new URL(window.location);

    if (this.currentPath) {
      url.searchParams.set("path", this.currentPath);
    }

    if (this.currentSearchQuery) {
      url.searchParams.set("search", this.currentSearchQuery);
    }

    return url.toString();
  }

  /**
   * Parse path from breadcrumb click
   * @param {string} breadcrumbPath - Path from breadcrumb data attribute
   * @returns {string} Parsed path
   */
  parseBreadcrumbPath(breadcrumbPath) {
    return breadcrumbPath || "";
  }

  /**
   * Get parent path
   * @param {string} currentPath - Current directory path
   * @returns {string} Parent path
   */
  getParentPath(currentPath) {
    if (!currentPath) return "";

    const pathParts = currentPath.split("/");
    pathParts.pop();
    return pathParts.join("/");
  }

  /**
   * Get path segments for breadcrumb
   * @param {string} path - Directory path
   * @returns {Array} Array of path segments with their full paths
   */
  getPathSegments(path) {
    const segments = [];
    const pathParts = path.split("/").filter((part) => part.length > 0);
    let currentPath = "";

    pathParts.forEach((part) => {
      currentPath += (currentPath ? "/" : "") + part;
      segments.push({
        name: part,
        path: currentPath,
      });
    });

    return segments;
  }
}
