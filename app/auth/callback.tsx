import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { getStoredEmail } from '@/features/auth/services/authService';
import { COLORS, FONTS } from '@/config/theme';

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    handleMagicLink();
  }, []);

  const handleMagicLink = async () => {
    try {
      // Reconstruct the full URL from params
      const fullUrl = `https://ahoy.bdot.house/auth/callback/?${new URLSearchParams(params as Record<string, string>).toString()}`;

      if (isSignInWithEmailLink(auth, fullUrl)) {
        // Get stored email
        const email = await getStoredEmail();

        if (email) {
          await signInWithEmailLink(auth, email, fullUrl);
          // Auth state listener will handle navigation
          router.replace('/(main)/(tabs)');
        } else {
          // No stored email - need to ask user
          router.replace('/(auth)/login?error=no_email');
        }
      } else {
        router.replace('/(auth)/login?error=invalid_link');
      }
    } catch (error) {
      console.error('Magic link error:', error);
      router.replace('/(auth)/login?error=auth_failed');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.text}>Prijava u tijeku...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 16,
    fontFamily: FONTS.mono,
    fontSize: 16,
    color: COLORS.foreground,
  },
});
