// Silsila Design System — Typed constants for all design tokens
// This is the single source of truth for all visual design decisions.

export const colors = {
  amber: {
    50: "#FFF8EB",
    100: "#FEEFC3",
    200: "#FAC775",
    300: "#F0B04E",
    400: "#D4922A",
    500: "#BA7517",
    600: "#9E6214",
    700: "#8A5610",
    800: "#6B430C",
    900: "#412402",
  },
  teal: {
    50: "#EDFBF5",
    100: "#D0F5E6",
    200: "#9FE1CB",
    300: "#6ECBAB",
    400: "#3DB88E",
    500: "#1D9E75",
    600: "#198A66",
    700: "#157A5A",
    800: "#0F5E44",
    900: "#04342C",
  },
  stone: {
    50: "#F5F5F4",
    100: "#ECEAE4",
    200: "#D3D1C7",
    300: "#B8B6AC",
    400: "#A09E96",
    500: "#888780",
    600: "#706F69",
    700: "#5C5B56",
    800: "#3E3E3B",
    900: "#2C2C2A",
  },
  semantic: {
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
  },
  background: {
    light: "#FAFAF8",
    dark: "#0F0F0E",
  },
  card: {
    light: "#FFFFFF",
    dark: "#1A1A19",
  },
  surface: {
    light: "#F5F5F3",
    dark: "#242422",
  },
} as const;

export const fonts = {
  serif: "'Palatino Linotype', 'Book Antiqua', Georgia, serif",
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

export const fontSizes = {
  xs: "0.75rem",   // 12px
  sm: "0.875rem",  // 14px
  base: "1rem",    // 16px
  lg: "1.125rem",  // 18px
  xl: "1.25rem",   // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem",  // 36px
  "5xl": "3rem",     // 48px
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
} as const;

export const borderRadius = {
  sm: "4px",
  node: "6px",
  card: "8px",
  md: "8px",
  lg: "12px",
  modal: "12px",
  pill: "9999px",
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/** Node colors for the family tree visualization */
export const nodeColors = {
  male: {
    fill: colors.stone[200],
    fillDark: colors.stone[700],
    border: colors.stone[700],
    borderDark: colors.stone[400],
  },
  female: {
    fill: colors.teal[200],
    fillDark: colors.teal[800],
    border: colors.teal[700],
    borderDark: colors.teal[400],
  },
  selected: {
    fill: colors.amber[200],
    fillDark: colors.amber[700],
    border: colors.amber[500],
    borderDark: colors.amber[400],
  },
  unknown: {
    fill: "transparent",
    fillDark: "transparent",
    border: colors.stone[400],
    borderDark: colors.stone[500],
  },
} as const;

/** Edge styles for family tree visualization */
export const edgeStyles = {
  parentChild: {
    stroke: colors.stone[400],
    strokeWidth: 1.5,
    style: "solid" as const,
  },
  spouse: {
    stroke: colors.amber[500],
    strokeWidth: 2,
    style: "double" as const,
  },
  unverified: {
    stroke: colors.stone[300],
    strokeWidth: 1,
    style: "dashed" as const,
    opacity: 0.5,
  },
} as const;

/** Documentation status configurations */
export const documentationStatus = {
  complete: { label: "Complete", color: colors.semantic.success },
  partial: { label: "Partial", color: colors.semantic.warning },
  pending: { label: "Pending", color: colors.stone[400] },
} as const;

/** Privacy level configurations */
export const privacyLevels = {
  public: { label: "Public", description: "Visible to everyone" },
  family: { label: "Family Only", description: "Visible to verified family members" },
  private: { label: "Private", description: "Hidden from all except administrators" },
} as const;

/** User role configurations */
export const userRoles = {
  viewer: { label: "Viewer", level: 0 },
  contributor: { label: "Contributor", level: 1 },
  village_admin: { label: "Village Admin", level: 2 },
  super_admin: { label: "Super Admin", level: 3 },
} as const;

export type Color = typeof colors;
export type NodeColor = typeof nodeColors;
export type EdgeStyle = typeof edgeStyles;
export type UserRole = keyof typeof userRoles;
export type PrivacyLevel = keyof typeof privacyLevels;
export type DocumentationStatusType = keyof typeof documentationStatus;
