/**
 * Application constants
 * Centralized configuration values to avoid hardcoding throughout the codebase
 */

// App Info
export const APP_NAME = 'TIPIT';
export const APP_TAGLINE = 'Share your travel tips with the world';
export const APP_VERSION = '1.0.0';

// API & Network
export const API_TIMEOUT_MS = 30000;
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;

// Image Upload
export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const IMAGE_MAX_SIZE_MB = 5;
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const IMAGE_VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;
export const TIP_MAX_IMAGES = 5;

// Pagination
export const TIPS_PER_PAGE = 20;
export const MESSAGES_PER_PAGE = 50;
export const FRIENDS_PER_PAGE = 20;

// Cache Times (React Query)
export const CACHE_STALE_TIME_MS = 1000 * 60 * 5; // 5 minutes
export const CACHE_GC_TIME_MS = 1000 * 60 * 30; // 30 minutes

// User Input Limits
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 6;
export const TIP_TITLE_MAX_LENGTH = 100;
export const TIP_DESCRIPTION_MAX_LENGTH = 2000;
export const MESSAGE_MAX_LENGTH = 1000;
export const REPORT_DESCRIPTION_MAX_LENGTH = 500;

// Map
export const MAP_DEFAULT_CENTER: [number, number] = [0, 20]; // longitude, latitude
export const MAP_DEFAULT_ZOOM = 2;
export const MAP_MIN_ZOOM = 1;
export const MAP_MAX_ZOOM = 18;

// Dates
export const DATE_FORMAT_DISPLAY = 'MMM d, yyyy';
export const DATE_FORMAT_FULL = 'MMMM d, yyyy h:mm a';

// Toast Durations (ms)
export const TOAST_DURATION_SHORT = 3000;
export const TOAST_DURATION_DEFAULT = 5000;
export const TOAST_DURATION_LONG = 8000;

// Feature Flags
export const FEATURES = {
  CHAT_ENABLED: true,
  FRIENDSHIPS_ENABLED: true,
  IMAGE_UPLOAD_ENABLED: true,
  MODERATION_ENABLED: true,
} as const;

// Categories
export const TIP_CATEGORIES = [
  'general',
  'food',
  'attractions',
  'activities',
  'accommodation',
  'other',
] as const;

export type TipCategory = typeof TIP_CATEGORIES[number];

// Report Reasons
export const REPORT_REASONS = [
  'spam',
  'inappropriate',
  'harassment',
  'misinformation',
  'other',
] as const;

export type ReportReason = typeof REPORT_REASONS[number];

// Privacy Settings
export const PRIVACY_SETTINGS = ['public', 'friends_only', 'private'] as const;
export type PrivacySetting = typeof PRIVACY_SETTINGS[number];

// Contact Email
export const CONTACT_EMAIL = 'support@tipit.app';
export const PRIVACY_EMAIL = 'privacy@tipit.app';

// External Links
export const EXTERNAL_LINKS = {
  TERMS: '/terms',
  PRIVACY: '/privacy',
  SUPPORT: `mailto:${CONTACT_EMAIL}`,
} as const;
