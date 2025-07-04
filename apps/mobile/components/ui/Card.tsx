import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  touchableProps?: TouchableOpacityProps;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  onPress,
  touchableProps,
  style,
  children,
  ...rest
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getCardStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.card];

    switch (variant) {
      case 'elevated':
        base.push({
          backgroundColor: colors.card,
          shadowColor: colors.shadowColor,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        });
        break;
      case 'outlined':
        base.push({
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        });
        break;
      case 'filled':
        base.push({
          backgroundColor: colors.surfaceLight,
        });
        break;
    }

    switch (padding) {
      case 'small':
        base.push(styles.paddingSmall);
        break;
      case 'large':
        base.push(styles.paddingLarge);
        break;
      default:
        base.push(styles.paddingMedium);
    }

    return base;
  };

  const content = (
    <View style={[getCardStyle(), style]} {...rest}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        {...touchableProps}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  paddingSmall: {
    padding: 12,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 20,
  },
});
