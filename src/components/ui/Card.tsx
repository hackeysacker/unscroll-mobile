import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function CardHeader({ children, style }: CardProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }: CardProps) {
  return <View style={[styles.title, style]}>{children}</View>;
}

export function CardDescription({ children, style }: CardProps) {
  return <View style={[styles.description, style]}>{children}</View>;
}

export function CardContent({ children, style }: CardProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  content: {
    // Content styles
  },
});

