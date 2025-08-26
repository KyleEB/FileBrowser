/**
 * Application Configuration
 */
const config = {
  // API Configuration
  api: {
    baseUrl: "http://localhost:5000/api/filebrowser", // API URL (same for Docker and local development)
  },

  // Application Settings
  app: {
    name: "File Browser",
    version: "1.0.0",
    maxFileSize: 100 * 1024 * 1024, // 100MB
    supportedTextExtensions: [
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
    ],
  },
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
} else {
  window.config = config;
}
