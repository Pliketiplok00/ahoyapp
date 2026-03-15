/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the app.
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Anchor } from 'phosphor-react-native';
import { COLORS, SPACING, FONTS, BORDERS } from '@/config/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log errors to console
    // TODO: Add crash reporting service post-launch (Sentry, Crashlytics, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Anchor size={64} color={COLORS.foreground} weight="fill" />
          <Text style={styles.title}>UPS!</Text>
          <Text style={styles.message}>Nešto je pošlo po zlu.</Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>POKUŠAJ PONOVO</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.foreground,
    marginBottom: SPACING.sm,
  },
  message: {
    fontFamily: FONTS.mono,
    fontSize: 16,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.black,
  },
  buttonText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    color: COLORS.black,
  },
});
