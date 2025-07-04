import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { designTokens, SpacingToken, FontSizeToken, BorderRadiusToken, ShadowToken } from '@/constants/Tokens';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Hook customizado para sistema de design
 * Facilita o uso de tokens de design e criação de estilos consistentes
 */
export const useDesignSystem = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Funções utilitárias para estilos
  const createStyle = useMemo(() => ({
    // Spacing utilities
    spacing: (size: SpacingToken): ViewStyle => ({
      padding: designTokens.spacing[size],
    }),
    
    spacingX: (size: SpacingToken): ViewStyle => ({
      paddingHorizontal: designTokens.spacing[size],
    }),
    
    spacingY: (size: SpacingToken): ViewStyle => ({
      paddingVertical: designTokens.spacing[size],
    }),
    
    margin: (size: SpacingToken): ViewStyle => ({
      margin: designTokens.spacing[size],
    }),
    
    marginX: (size: SpacingToken): ViewStyle => ({
      marginHorizontal: designTokens.spacing[size],
    }),
    
    marginY: (size: SpacingToken): ViewStyle => ({
      marginVertical: designTokens.spacing[size],
    }),

    // Typography utilities
    typography: (size: FontSizeToken, weight?: keyof typeof designTokens.typography.fontWeights): TextStyle => ({
      fontSize: designTokens.typography.fontSizes[size],
      fontWeight: weight ? designTokens.typography.fontWeights[weight] : '400',
      color: colors.text,
    }),

    // Shadow utilities
    shadow: (size: ShadowToken): ViewStyle => ({
      ...designTokens.shadows[size],
      shadowColor: colors.shadowColor,
    }),

    // Border radius utilities
    rounded: (size: BorderRadiusToken): ViewStyle => ({
      borderRadius: designTokens.borderRadius[size],
    }),

    // Layout utilities
    container: (): ViewStyle => ({
      paddingHorizontal: designTokens.layout.container.paddingHorizontal,
    }),

    section: (): ViewStyle => ({
      marginBottom: designTokens.layout.section.marginBottom,
    }),

    card: (variant: 'elevated' | 'outlined' | 'filled' = 'elevated'): ViewStyle => {
      const base: ViewStyle = {
        borderRadius: designTokens.layout.card.borderRadius,
        padding: designTokens.layout.card.padding,
      };

      switch (variant) {
        case 'elevated':
          return {
            ...base,
            backgroundColor: colors.card,
            ...designTokens.shadows.md,
            shadowColor: colors.shadowColor,
          };
        case 'outlined':
          return {
            ...base,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          };
        case 'filled':
          return {
            ...base,
            backgroundColor: colors.surfaceLight,
          };
        default:
          return base;
      }
    },

    // Flex utilities
    flex: {
      center: (): ViewStyle => ({
        justifyContent: 'center',
        alignItems: 'center',
      }),
      
      between: (): ViewStyle => ({
        justifyContent: 'space-between',
        alignItems: 'center',
      }),
      
      row: (): ViewStyle => ({
        flexDirection: 'row',
      }),
      
      column: (): ViewStyle => ({
        flexDirection: 'column',
      }),

      wrap: (): ViewStyle => ({
        flexWrap: 'wrap',
      }),
    },

    // Color utilities
    colors: {
      background: colors.background,
      surface: colors.surface,
      primary: colors.primary,
      secondary: colors.secondary,
      text: colors.text,
      textSecondary: colors.textSecondary,
      border: colors.border,
      error: colors.error,
      success: colors.success,
      warning: colors.warning,
      info: colors.info,
    },
  }), [colors]);

  // Utilitários para componentes específicos
  const components = useMemo(() => ({
    button: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
      const baseStyle: ViewStyle = {
        borderRadius: designTokens.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...designTokens.variants.button.sizes[size],
      };

      switch (variant) {
        case 'primary':
          return { ...baseStyle, backgroundColor: colors.primary };
        case 'secondary':
          return { ...baseStyle, backgroundColor: colors.secondary };
        case 'outline':
          return { 
            ...baseStyle, 
            backgroundColor: 'transparent', 
            borderWidth: 2, 
            borderColor: colors.primary 
          };
        case 'ghost':
          return { ...baseStyle, backgroundColor: 'transparent' };
        case 'danger':
          return { ...baseStyle, backgroundColor: colors.error };
        default:
          return baseStyle;
      }
    },

    input: (hasError = false): ViewStyle => ({
      borderRadius: designTokens.borderRadius.lg,
      paddingHorizontal: designTokens.spacing.md,
      paddingVertical: designTokens.spacing.sm,
      backgroundColor: colors.surfaceLight,
      borderWidth: hasError ? 2 : 1,
      borderColor: hasError ? colors.error : colors.border,
    }),

    header: (): ViewStyle => ({
      paddingHorizontal: designTokens.spacing.lg,
      paddingVertical: designTokens.spacing.md,
    }),

    formGroup: (): ViewStyle => ({
      marginBottom: designTokens.spacing.lg,
    }),

    label: (): TextStyle => ({
      fontSize: designTokens.typography.fontSizes.md,
      fontWeight: designTokens.typography.fontWeights.semibold,
      color: colors.text,
      marginBottom: designTokens.spacing.sm,
    }),

    errorText: (): TextStyle => ({
      fontSize: designTokens.typography.fontSizes.sm,
      color: colors.error,
      marginTop: designTokens.spacing.xs,
    }),
  }), [colors]);

  // Shorthand para estilos comuns
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: designTokens.spacing.md,
    },
    
    header: {
      paddingHorizontal: designTokens.spacing.lg,
      paddingVertical: designTokens.spacing.md,
    },
    
    title: {
      fontSize: designTokens.typography.fontSizes.xxxl,
      fontWeight: designTokens.typography.fontWeights.bold,
      color: colors.text,
      marginBottom: designTokens.spacing.sm,
    },
    
    subtitle: {
      fontSize: designTokens.typography.fontSizes.md,
      color: colors.textSecondary,
      lineHeight: designTokens.typography.lineHeights.relaxed * designTokens.typography.fontSizes.md,
    },
    
    section: {
      marginBottom: designTokens.spacing.xl,
    },
    
    sectionTitle: {
      fontSize: designTokens.typography.fontSizes.lg,
      fontWeight: designTokens.typography.fontWeights.semibold,
      color: colors.text,
      marginBottom: designTokens.spacing.md,
    },
    
    card: {
      backgroundColor: colors.card,
      borderRadius: designTokens.borderRadius.xl,
      padding: designTokens.spacing.md,
      ...designTokens.shadows.md,
      shadowColor: colors.shadowColor,
    },
    
    formGroup: {
      marginBottom: designTokens.spacing.lg,
    },
    
    label: {
      fontSize: designTokens.typography.fontSizes.md,
      fontWeight: designTokens.typography.fontWeights.semibold,
      color: colors.text,
      marginBottom: designTokens.spacing.sm,
    },
    
    input: {
      borderRadius: designTokens.borderRadius.lg,
      paddingHorizontal: designTokens.spacing.md,
      paddingVertical: designTokens.spacing.sm,
      fontSize: designTokens.typography.fontSizes.md,
      backgroundColor: colors.surfaceLight,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    
    errorText: {
      fontSize: designTokens.typography.fontSizes.sm,
      color: colors.error,
      marginTop: designTokens.spacing.xs,
    },
    
    button: {
      borderRadius: designTokens.borderRadius.lg,
      paddingHorizontal: designTokens.spacing.lg,
      paddingVertical: designTokens.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    buttonText: {
      fontSize: designTokens.typography.fontSizes.md,
      fontWeight: designTokens.typography.fontWeights.semibold,
    },
  }), [colors]);

  return {
    tokens: designTokens,
    colors,
    createStyle,
    components,
    styles,
  };
};

// Hook para breakpoints responsivos (futuro)
export const useBreakpoints = () => {
  return {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  };
};