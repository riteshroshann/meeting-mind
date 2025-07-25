// Configuration file for the AI Meeting Assistant

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    endpoints: {
      processAudio: "/api/process-audio/",
      testConnection: "/api/test-connection/",
      health: "/api/health/",
      supportedLanguages: "/api/supported-languages/",
    },
    timeout: 120000, // 2 minutes for audio processing
  },

  // Audio Configuration
  audio: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedFormats: ["audio/wav", "audio/mp3", "audio/m4a", "audio/webm"],
    sampleRate: 16000,
    channels: 1, // mono
    recordingOptions: {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 128000,
    },
  },

  // Language Configuration
  languages: {
    supported: [
      { code: "hi", name: "Hindi", native: "हिन्दी" },
      { code: "en", name: "English", native: "English" },
      { code: "bn", name: "Bengali", native: "বাংলা" },
      { code: "te", name: "Telugu", native: "తెలుగు" },
      { code: "mr", name: "Marathi", native: "मराठी" },
      { code: "ta", name: "Tamil", native: "தமிழ்" },
      { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
      { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
      { code: "ml", name: "Malayalam", native: "മലയാളം" },
      { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
      { code: "as", name: "Assamese", native: "অসমীয়া" },
      { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
    ],
    default: {
      primary: "hi",
      target: "en",
    },
  },

  // UI Configuration
  ui: {
    theme: {
      primary: "#3b82f6",
      secondary: "#64748b",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    },
    animations: {
      duration: 300,
      easing: "ease-in-out",
    },
    maxRetries: 3,
    retryDelay: 1000,
  },

  // Feature Flags
  features: {
    realTimeRecording: true,
    fileUpload: true,
    languageDetection: false,
    exportResults: true,
    sessionHistory: true,
  },

  // Development Configuration
  development: {
    enableLogging: process.env.NODE_ENV === "development",
    mockApi: false,
    debugMode: process.env.NODE_ENV === "development",
  },
}

export type Config = typeof config
export default config
