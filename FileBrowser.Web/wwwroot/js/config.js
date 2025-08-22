/**
 * Application Configuration
 */
const config = {
  // API Configuration
  api: {
    baseUrl:
      process.env.NODE_ENV === "production"
        ? "http://localhost:5002/api/filebrowser" // Production API URL
        : "http://localhost:5002/api/filebrowser", // Development API URL
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
