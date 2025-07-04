import React from 'react';
import { View, ViewProps, ScrollView, ScrollViewProps, KeyboardAvoidingView, Platform } from 'react-native';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { SpacingToken } from '@/constants/Tokens';

interface ContainerProps extends ViewProps {
  padding?: SpacingToken;
  background?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ 
  padding = 'md', 
  background = true, 
  style, 
  children, 
  ...rest 
}) => {
  const { createStyle, colors } = useDesignSystem();

  return (
    <View
      style={[
        createStyle.container(),
        createStyle.spacing(padding),
        background && { backgroundColor: colors.background },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

interface ScrollContainerProps extends ScrollViewProps {
  padding?: SpacingToken;
  background?: boolean;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ 
  padding = 'md', 
  background = true, 
  style, 
  contentContainerStyle,
  children, 
  ...rest 
}) => {
  const { createStyle, colors } = useDesignSystem();

  return (
    <ScrollView
      style={[
        { flex: 1 },
        background && { backgroundColor: colors.background },
        style,
      ]}
      contentContainerStyle={[
        { flexGrow: 1 },
        createStyle.spacing(padding),
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
};

interface SectionProps extends ViewProps {
  spacing?: SpacingToken;
}

export const Section: React.FC<SectionProps> = ({ 
  spacing = 'xl', 
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

interface RowProps extends ViewProps {
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: SpacingToken;
  wrap?: boolean;
}

export const Row: React.FC<RowProps> = ({ 
  justify = 'flex-start',
  align = 'center',
  gap,
  wrap = false,
  style, 
  children, 
  ...rest 
}) => {
  const { createStyle } = useDesignSystem();

  return (
    <View
      style={[
        createStyle.flex.row(),
        { justifyContent: justify, alignItems: align },
        wrap && createStyle.flex.wrap(),
        gap && { gap: createStyle.spacing(gap).padding },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

interface ColumnProps extends ViewProps {
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: SpacingToken;
}

export const Column: React.FC<ColumnProps> = ({ 
  justify = 'flex-start',
  align = 'flex-start',
  gap,
  style, 
  children, 
  ...rest 
}) => {
  const { createStyle } = useDesignSystem();

  return (
    <View
      style={[
        createStyle.flex.column(),
        { justifyContent: justify, alignItems: align },
        gap && { gap: createStyle.spacing(gap).padding },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

interface CenterProps extends ViewProps {
  flex?: boolean;
}

export const Center: React.FC<CenterProps> = ({ 
  flex = false,
  style, 
  children, 
  ...rest 
}) => {
  const { createStyle } = useDesignSystem();

  return (
    <View
      style={[
        createStyle.flex.center(),
        flex && { flex: 1 },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

interface SpacerProps {
  size?: SpacingToken;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md',
  horizontal = false,
}) => {
  const { createStyle } = useDesignSystem();

  return (
    <View
      style={
        horizontal
          ? createStyle.spacingX(size)
          : createStyle.spacingY(size)
      }
    />
  );
};

interface FormProps extends ViewProps {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ style, children, ...rest }) => {
  const { colors } = useDesignSystem();

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      {...rest}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

interface HeaderProps extends ViewProps {
  safe?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  safe = false,
  style, 
  children, 
  ...rest 
}) => {
  const { createStyle } = useDesignSystem();

  return (
    <View
      style={[
        createStyle.header(),
        safe && { paddingTop: 50 }, // Para status bar
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};