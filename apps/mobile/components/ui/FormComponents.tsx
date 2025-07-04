import React from 'react';
import { View, ViewProps, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { Typography } from './Typography';
import { SpacingToken } from '@/constants/Tokens';

interface FormGroupProps extends ViewProps {
  spacing?: SpacingToken;
}

export const FormGroup: React.FC<FormGroupProps> = ({ 
  spacing = 'lg',
  style, 
  children, 
  ...rest 
}) => {
  const { createStyle } = useDesignSystem();

  return (
    <View
      style={[
        createStyle.marginY(spacing),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  style?: any;
}

export const FormLabel: React.FC<FormLabelProps> = ({ 
  children, 
  required = false, 
  style 
}) => {
  return (
    <Typography variant="body" weight="semibold" style={[{ marginBottom: 8 }, style]}>
      {children}
      {required && <Typography color="error"> *</Typography>}
    </Typography>
  );
};

interface FormErrorProps {
  children: React.ReactNode;
  style?: any;
}

export const FormError: React.FC<FormErrorProps> = ({ children, style }) => {
  return (
    <Typography variant="caption" color="error" style={[{ marginTop: 4 }, style]}>
      {children}
    </Typography>
  );
};

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  checked, 
  onPress, 
  label, 
  disabled = false 
}) => {
  const { colors } = useDesignSystem();

  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <FontAwesome
        name={checked ? 'check-square-o' : 'square-o'}
        size={20}
        color={disabled ? colors.textSecondary : colors.primary}
      />
      {label && (
        <Typography 
          variant="body" 
          color={disabled ? 'textSecondary' : 'text'}
          style={styles.checkboxLabel}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

export const RadioButton: React.FC<RadioButtonProps> = ({ 
  selected, 
  onPress, 
  label, 
  disabled = false 
}) => {
  const { colors } = useDesignSystem();

  return (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.radioButton,
        { borderColor: disabled ? colors.textSecondary : colors.primary }
      ]}>
        {selected && (
          <View style={[
            styles.radioButtonInner,
            { backgroundColor: disabled ? colors.textSecondary : colors.primary }
          ]} />
        )}
      </View>
      {label && (
        <Typography 
          variant="body" 
          color={disabled ? 'textSecondary' : 'text'}
          style={styles.radioLabel}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ 
  value, 
  onValueChange, 
  label, 
  disabled = false 
}) => {
  const { colors } = useDesignSystem();

  return (
    <View style={styles.switchContainer}>
      {label && (
        <Typography 
          variant="body" 
          color={disabled ? 'textSecondary' : 'text'}
          style={styles.switchLabel}
        >
          {label}
        </Typography>
      )}
      <TouchableOpacity
        style={[
          styles.switchTrack,
          { backgroundColor: value ? colors.primary : colors.border },
          disabled && { opacity: 0.5 }
        ]}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={[
          styles.switchThumb,
          { 
            backgroundColor: colors.surface,
            transform: [{ translateX: value ? 20 : 0 }]
          }
        ]} />
      </TouchableOpacity>
    </View>
  );
};

interface TagProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onRemove 
}) => {
  const { colors } = useDesignSystem();

  const getTagColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[
      styles.tag,
      size === 'sm' ? styles.tagSmall : styles.tagMedium,
      { backgroundColor: getTagColor() }
    ]}>
      <Typography 
        variant={size === 'sm' ? 'caption' : 'body'}
        style={styles.tagText}
      >
        {children}
      </Typography>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.tagRemove}>
          <FontAwesome name="times-circle" size={14} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

interface DividerProps {
  color?: string;
  thickness?: number;
  style?: any;
}

export const Divider: React.FC<DividerProps> = ({ 
  color, 
  thickness = 1, 
  style 
}) => {
  const { colors } = useDesignSystem();

  return (
    <View style={[
      styles.divider,
      { 
        backgroundColor: color || colors.border,
        height: thickness,
      },
      style,
    ]} />
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    marginLeft: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: 'white',
  },
  tagRemove: {
    marginLeft: 6,
  },
  divider: {
    width: '100%',
    marginVertical: 8,
  },
});