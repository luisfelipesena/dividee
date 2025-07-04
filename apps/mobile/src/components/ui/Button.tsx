import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
        disabled || loading ? styles.buttonDisabled : null,
        fullWidth ? styles.buttonFullWidth : null,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : colors.text.primary} 
        />
      ) : (
        <Text style={[
          styles.text,
          styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
          variant === 'outline' || variant === 'ghost' ? styles.textOutline : styles.textDefault,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  
  // Size variants
  buttonSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  } as ViewStyle,
  buttonMd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  } as ViewStyle,
  buttonLg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 52,
  } as ViewStyle,
  
  // Variant styles
  buttonPrimary: {
    backgroundColor: colors.primary[500],
  } as ViewStyle,
  buttonSecondary: {
    backgroundColor: colors.slate[600],
  } as ViewStyle,
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  } as ViewStyle,
  buttonGhost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  
  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  
  buttonFullWidth: {
    width: '100%',
  } as ViewStyle,
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  textSm: {
    fontSize: typography.fontSize.sm,
  } as TextStyle,
  textMd: {
    fontSize: typography.fontSize.base,
  } as TextStyle,
  textLg: {
    fontSize: typography.fontSize.lg,
  } as TextStyle,
  textDefault: {
    color: colors.text.primary,
  } as TextStyle,
  textOutline: {
    color: colors.primary[500],
  } as TextStyle,
}); 