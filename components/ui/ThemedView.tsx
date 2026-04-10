import React from 'react';
import { View, ViewProps } from 'react-native';
import { COLORS } from '@/constants/colors';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'surface';
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = lightColor || COLORS.background;

  const variantStyles = {
    default: { backgroundColor },
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    surface: {
      backgroundColor: COLORS.surface,
      borderRadius: 16,
    },
  };

  return <View style={[variantStyles[variant], style]} {...otherProps} />;
}