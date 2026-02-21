/**
 * Capture Screen
 *
 * Camera interface for scanning receipts.
 * Takes photo or picks from gallery, then navigates to review screen.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  COLORS,
  SPACING,
  BORDERS,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
  TYPOGRAPHY,
  ANIMATION,
} from '@/config/theme';
import { Screen } from '@/components/layout';

export default function CaptureScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Request permission on mount
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  /**
   * Take photo with camera
   */
  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        // Navigate to review screen with image URI
        router.push({
          pathname: '/booking/expenses/review/[bookingId]',
          params: { bookingId: bookingId || '', imageUri: photo.uri },
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Pick image from gallery
   */
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        // Navigate to review screen with image URI
        router.push({
          pathname: '/booking/expenses/review/[bookingId]',
          params: { bookingId: bookingId || '', imageUri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  /**
   * Handle close button
   */
  const handleClose = () => {
    router.back();
  };

  // Loading state while checking permissions
  if (!permission) {
    return (
      <Screen noPadding>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        </View>
      </Screen>
    );
  }

  // Permission denied state
  if (!permission.granted) {
    return (
      <Screen noPadding>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
            <Text style={styles.headerTitle}>SCAN RECEIPT</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Permission Denied */}
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionIcon}>📷</Text>
            <Text style={styles.permissionTitle}>CAMERA ACCESS REQUIRED</Text>
            <Text style={styles.permissionText}>
              Allow camera access to scan receipts, or pick an image from your gallery.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.permissionButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>ALLOW CAMERA</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.galleryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePickFromGallery}
            >
              <Text style={styles.galleryButtonText}>PICK FROM GALLERY</Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  // Camera view
  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SCAN RECEIPT</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Camera Preview */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onCameraReady={() => setIsReady(true)}
          >
            {/* Camera frame overlay */}
            <View style={styles.frameOverlay}>
              <View style={styles.frame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
            </View>
          </CameraView>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Position receipt in frame
        </Text>

        {/* Capture Button */}
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.captureButton,
              pressed && styles.captureButtonPressed,
              (!isReady || isCapturing) && styles.captureButtonDisabled,
            ]}
            onPress={handleTakePhoto}
            disabled={!isReady || isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color={COLORS.foreground} size="small" />
            ) : (
              <Text style={styles.captureButtonText}>📷 CAPTURE</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Gallery Button */}
          <Pressable
            style={({ pressed }) => [
              styles.galleryButtonAlt,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePickFromGallery}
          >
            <Text style={styles.galleryButtonAltText}>🖼 PICK FROM GALLERY</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderBottomWidth: BORDERS.heavy,
    borderBottomColor: COLORS.foreground,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
  },
  closeButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    color: COLORS.foreground,
    lineHeight: TYPOGRAPHY.sizes.sectionTitle,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    marginTop: SPACING.md,
  },

  // Permission Denied
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  permissionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  permissionText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  permissionButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
  },
  galleryButton: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    ...SHADOWS.brutSm,
  },
  galleryButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Camera
  cameraContainer: {
    flex: 1,
    margin: SPACING.md,
    borderWidth: BORDERS.heavy,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    overflow: 'hidden',
    ...SHADOWS.brut,
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '80%',
    aspectRatio: 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.accent,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  // Instructions
  instructions: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },

  // Controls
  controls: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  captureButton: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  captureButtonPressed: {
    transform: ANIMATION.pressedTransform,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.foreground,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.muted,
  },
  dividerText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.meta,
    color: COLORS.mutedForeground,
    marginHorizontal: SPACING.md,
  },

  // Gallery Button Alt
  galleryButtonAlt: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.brutSm,
  },
  galleryButtonAltText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Pressed state
  buttonPressed: {
    transform: ANIMATION.pressedTransform,
  },
});
