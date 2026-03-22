export const COLORS = {
  // Background colors - calming, deep tones
  background: {
    darkest: "#050A12",    // Deepest background for modals/cards
    dark: "#0A0F1A",        // Primary background
    medium: "#1A2634",      // Secondary background / cards
    light: "#2A3645",       // Elevated surfaces / hover states
    lighter: "#354252"      // Interactive elements / borders
  },
  
  // Accent colors - calming, warm tones
  accent: {
    primary: "#6D8C9E",     // Primary brand color
    secondary: "#4A6A8A",   // Secondary brand color
    tertiary: "#7AA5C0",    // Alternative accent
    warm: "#D9B48F",        // Warm accent for comfort
    soft: "#B8D4D4",        // Soft accent for backgrounds
    highlight: "#A5C8D8",   // Highlight color
    muted: "#5A7C94"        // Muted accent for disabled states
  },
  
  // Risk level colors - semantic meaning with accessibility
  risk: {
    crisis: "#A13D3D",      // Immediate danger - dark red
    high: "#D96C6C",        // High risk - soft red
    elevated: "#E6A56C",    // Elevated risk - warm orange
    moderate: "#B8C87A",    // Moderate risk - soft yellow-green
    low: "#4A908A",         // Low risk - teal
    // Legacy/alternative names for compatibility
    critical: "#B53D3D",    // Alternative crisis color
    medium: "#C9A05C",      // Alternative moderate color
    safe: "#4A908A"         // Alternative low color
  },
  
  // Text colors - readable contrast ratios
  text: {
    primary: "#E8F0F8",      // Primary text - highest contrast
    secondary: "#B0C8D8",    // Secondary text - good contrast
    tertiary: "#98B0C0",     // Tertiary text - medium contrast
    muted: "#8098A8",        // Muted text - lower contrast
    accent: "#7AA9C9",       // Accent text for links/highlights
    dark: "#405868",         // Dark text for light backgrounds
    inverse: "#0A0F1A",      // Inverse text for light backgrounds
    disabled: "#608090",     // Disabled state text
    placeholder: "#7090A0",  // Placeholder text
    error: "#D96C6C",        // Error text
    success: "#6AA88A",      // Success text
    warning: "#E6A56C"       // Warning text
  },
  
  // Border colors - subtle layering
  border: {
    lightest: "rgba(170, 200, 220, 0.1)",   // Subtle borders
    light: "rgba(170, 200, 220, 0.15)",      // Default borders
    medium: "rgba(170, 200, 220, 0.25)",     // Emphasized borders
    dark: "rgba(170, 200, 220, 0.35)",       // Strong borders
    focus: "rgba(170, 200, 220, 0.5)",       // Focus states
    hover: "rgba(170, 200, 220, 0.4)",       // Hover states
    active: "rgba(170, 200, 220, 0.6)",      // Active states
    // Alternative using white for compatibility
    white: {
      light: "rgba(255, 255, 255, 0.1)",
      medium: "rgba(255, 255, 255, 0.15)",
      strong: "rgba(255, 255, 255, 0.25)"
    }
  },
  
  // Semantic colors - for specific use cases
  semantic: {
    success: {
      light: "#6AA88A",
      dark: "#3D7858",
      bg: "rgba(106, 168, 138, 0.1)"
    },
    error: {
      light: "#D96C6C",
      dark: "#A13D3D",
      bg: "rgba(217, 108, 108, 0.1)"
    },
    warning: {
      light: "#E6A56C",
      dark: "#B87A3D",
      bg: "rgba(230, 165, 108, 0.1)"
    },
    info: {
      light: "#7AA5C0",
      dark: "#4A6A8A",
      bg: "rgba(122, 165, 192, 0.1)"
    }
  },
  
  // Interactive states
  interactive: {
    hover: {
      overlay: "rgba(170, 200, 220, 0.1)",
      background: "rgba(42, 54, 69, 0.8)"
    },
    active: {
      overlay: "rgba(170, 200, 220, 0.2)",
      background: "rgba(53, 66, 82, 0.8)"
    },
    disabled: {
      opacity: 0.5,
      background: "rgba(128, 152, 168, 0.2)"
    }
  },
  
  // Gradients - for visual depth
  gradients: {
    primary: "linear-gradient(135deg, #0A0F1A 0%, #1A2634 100%)",
    accent: "linear-gradient(135deg, #6D8C9E 0%, #7AA5C0 100%)",
    warm: "linear-gradient(135deg, #D9B48F 0%, #E6A56C 100%)",
    risk: {
      low: "linear-gradient(135deg, #4A908A 0%, #6AA88A 100%)",
      moderate: "linear-gradient(135deg, #B8C87A 0%, #C9A05C 100%)",
      high: "linear-gradient(135deg, #D96C6C 0%, #B86B6B 100%)",
      crisis: "linear-gradient(135deg, #B53D3D 0%, #A13D3D 100%)"
    }
  },
  
  // Shadows - for depth
  shadows: {
    sm: "0 2px 4px rgba(0, 0, 0, 0.3)",
    md: "0 4px 8px rgba(0, 0, 0, 0.4)",
    lg: "0 8px 16px rgba(0, 0, 0, 0.5)",
    xl: "0 16px 24px rgba(0, 0, 0, 0.6)",
    inner: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
    accent: "0 4px 12px rgba(122, 165, 192, 0.3)",
    warm: "0 4px 12px rgba(217, 180, 143, 0.2)"
  }
};

// Helper function to get color with opacity
export const getColorWithOpacity = (color, opacity) => {
  // Handle rgba colors
  if (color.startsWith('rgba')) {
    const matches = color.match(/[\d.]+/g);
    if (matches && matches.length >= 3) {
      return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${opacity})`;
    }
  }
  // Handle hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Helper function to get contrast color (black or white) based on background
export const getContrastColor = (backgroundColor) => {
  // Default to white text for dark backgrounds
  if (typeof backgroundColor === 'string') {
    if (backgroundColor.includes('dark') || backgroundColor.includes('0A0F')) {
      return COLORS.text.primary;
    }
    return COLORS.text.dark;
  }
  return COLORS.text.primary;
};

// Risk level order for sorting/comparison
export const RISK_LEVEL_ORDER = {
  crisis: 4,
  high: 3,
  elevated: 2,
  moderate: 1,
  low: 0
};

// Export individual color categories for easier imports
export const {
  background,
  accent,
  risk,
  text,
  border,
  semantic,
  interactive,
  gradients,
  shadows
} = COLORS;

// Default export for convenience
export default COLORS;