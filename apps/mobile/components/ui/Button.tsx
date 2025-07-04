import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      title,
      variant = 'primary',
      size = 'medium',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      style,
      ...rest
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const getButtonStyle = (): ViewStyle[] => {
      const base: ViewStyle[] = [styles.button];

      // Size styles
      switch (size) {
        case 'small':
          base.push(styles.small);
          break;
        case 'large':
          base.push(styles.large);
          break;
        default:
          base.push(styles.medium);
      }

      // Variant styles
      switch (variant) {
        case 'primary':
          base.push({
            backgroundColor: colors.primary,
          });
          break;
        case 'secondary':
          base.push({
            backgroundColor: colors.secondary,
          });
          break;
        case 'outline':
          base.push({
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary,
          });
          break;
        case 'ghost':
          base.push({
            backgroundColor: 'transparent',
          });
          break;
        case 'danger':
          base.push({
            backgroundColor: colors.error,
          });
          break;
      }

      if (fullWidth) {
        base.push(styles.fullWidth);
      }

      if (disabled || loading) {
        base.push(styles.disabled);
      }

      return base;
    };

    const getTextStyle = (): TextStyle[] => {
      const base: TextStyle[] = [styles.text];

      // Size styles
      switch (size) {
        case 'small':
          base.push(styles.textSmall);
          break;
        case 'large':
          base.push(styles.textLarge);
          break;
        default:
          base.push(styles.textMedium);
      }

      // Variant styles
      switch (variant) {
        case 'outline':
        case 'ghost':
          base.push({ color: colors.primary });
          break;
        default:
          base.push({ color: colors.textInverse });
      }

      return base;
    };

    const getIconColor = () => {
      switch (variant) {
        case 'outline':
        case 'ghost':
          return colors.primary;
        default:
          return colors.textInverse;
      }
    };

    const getIconSize = () => {
      switch (size) {
        case 'small':
          return 14;
        case 'large':
          return 20;
        default:
          return 16;
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[getButtonStyle(), style]}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={getIconColor()} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <FontAwesome
                name={icon}
                size={getIconSize()}
                color={getIconColor()}
                style={styles.iconLeft}
              />
            )}
            <Text style={getTextStyle()}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <FontAwesome
                name={icon}
                size={getIconSize()}
                color={getIconColor()}
                style={styles.iconRight}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
