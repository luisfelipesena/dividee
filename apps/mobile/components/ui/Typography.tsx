import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { FontSizeToken } from '@/constants/Tokens';

interface TypographyProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'textTertiary' | 'error' | 'success' | 'warning' | 'info';
  align?: 'left' | 'center' | 'right';
}

const variantMap: Record<TypographyProps['variant'] & string, FontSizeToken> = {
  display: 'display',
  h1: 'xxxl',
  h2: 'xxl',
  h3: 'xl',
  h4: 'lg',
  body: 'md',
  caption: 'sm',
  overline: 'xs',
};

const weightMap: Record<TypographyProps['weight'] & string, keyof typeof import('@/constants/Tokens').designTokens.typography.fontWeights> = {
  light: 'light',
  regular: 'regular',
  medium: 'medium',
  semibold: 'semibold',
  bold: 'bold',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight = 'regular',
  color = 'text',
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { createStyle, colors } = useDesignSystem();

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'text':
        return colors.text;
      case 'textSecondary':
        return colors.textSecondary;
      case 'textTertiary':
        return colors.textSecondary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.text;
    }
  };

  const fontSize = variantMap[variant];
  const fontWeight = weightMap[weight];

  return (
    <Text
      style={[
        createStyle.typography(fontSize, fontWeight),
        { color: getTextColor(), textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

// Componentes especializados para facilitar o uso
export const Heading = ({ level = 1, ...props }: Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }) => {
  const variants = ['h1', 'h2', 'h3', 'h4'] as const;
  return <Typography variant={variants[level - 1]} weight="bold" {...props} />;
};

export const Body = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" color="textSecondary" {...props} />
);

export const Label = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" weight="semibold" {...props} />
);

export const ErrorText = (props: Omit<TypographyProps, 'variant' | 'color'>) => (
  <Typography variant="caption" color="error" {...props} />
);