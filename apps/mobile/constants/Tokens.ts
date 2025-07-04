// Design Tokens - Sistema de design centralizado
export const designTokens = {
  // Spacing System (baseado em múltiplos de 4)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },

  // Typography System
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      display: 32,
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  // Border Radius System
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },

  // Shadow System
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Animation System
  animations: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
    },
    easing: {
      ease: 'ease',
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Layout System
  layout: {
    container: {
      paddingHorizontal: 16,
    },
    section: {
      marginBottom: 24,
    },
    card: {
      padding: 16,
      borderRadius: 16,
    },
  },

  // Component Variants
  variants: {
    button: {
      sizes: {
        sm: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
        md: { paddingHorizontal: 20, paddingVertical: 12, fontSize: 16 },
        lg: { paddingHorizontal: 24, paddingVertical: 16, fontSize: 18 },
      },
    },
    card: {
      padding: {
        sm: 12,
        md: 16,
        lg: 20,
      },
    },
  },
} as const;

// Utilitários para acessar tokens
export const getSpacing = (size: keyof typeof designTokens.spacing) => 
  designTokens.spacing[size];

export const getFontSize = (size: keyof typeof designTokens.typography.fontSizes) => 
  designTokens.typography.fontSizes[size];

export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => 
  designTokens.borderRadius[size];

export const getShadow = (size: keyof typeof designTokens.shadows) => 
  designTokens.shadows[size];

// Tipos para TypeScript
export type SpacingToken = keyof typeof designTokens.spacing;
export type FontSizeToken = keyof typeof designTokens.typography.fontSizes;
export type BorderRadiusToken = keyof typeof designTokens.borderRadius;
export type ShadowToken = keyof typeof designTokens.shadows;