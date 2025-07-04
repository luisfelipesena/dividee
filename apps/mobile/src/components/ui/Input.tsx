import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../styles/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
}

export default function Input({
  label,
  error,
  helper,
  size = 'md',
  fullWidth = true,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecureVisible(!isSecureVisible);
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    // Size variants
    switch (size) {
      case 'sm':
        baseStyle.push(styles.inputSm);
        break;
      case 'lg':
        baseStyle.push(styles.inputLg);
        break;
      default:
        baseStyle.push(styles.inputMd);
    }
    
    // Focus state
    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    // Error state
    if (error) {
      baseStyle.push(styles.inputError);
    }
    
    // Full width
    if (fullWidth) {
      baseStyle.push(styles.inputFullWidth);
    }
    
    return baseStyle;
  };

  return (
    <View style={[styles.container, fullWidth && styles.containerFullWidth]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={getInputStyle()}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
                 <TextInput
           style={[
             styles.textInput,
             leftIcon ? styles.textInputWithLeftIcon : null,
             (rightIcon || secureTextEntry) ? styles.textInputWithRightIcon : null,
           ]}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={toggleSecureEntry}
          >
            <Text style={styles.eyeIcon}>
              {isSecureVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helper && !error && (
        <Text style={styles.helperText}>{helper}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  } as ViewStyle,
  
  containerFullWidth: {
    width: '100%',
  } as ViewStyle,
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  } as TextStyle,
  
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.slate[600],
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  
  inputSm: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  } as ViewStyle,
  
  inputMd: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  
  inputLg: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  
  inputFocused: {
    borderColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOpacity: 0.1,
  } as ViewStyle,
  
  inputError: {
    borderColor: colors.error,
  } as ViewStyle,
  
  inputFullWidth: {
    width: '100%',
  } as ViewStyle,
  
  leftIconContainer: {
    marginRight: spacing.sm,
  } as ViewStyle,
  
  rightIconContainer: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  } as ViewStyle,
  
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    padding: 0,
  } as TextStyle,
  
  textInputWithLeftIcon: {
    marginLeft: 0,
  } as TextStyle,
  
  textInputWithRightIcon: {
    marginRight: 0,
  } as TextStyle,
  
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  } as TextStyle,
  
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  } as TextStyle,
  
  eyeIcon: {
    fontSize: 16,
  } as TextStyle,
}); 