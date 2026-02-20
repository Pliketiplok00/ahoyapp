/**
 * AddScoreEntry Component
 *
 * Form for captain to add score entries to crew members.
 * Captain only - crew members cannot add scores.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { Button } from '../../../components/ui';
import { SCORE_POINTS, type ScorePoints, type User } from '../../../types/models';

interface AddScoreEntryProps {
  crewMembers: User[];
  currentUserId: string;
  onSubmit: (
    toUserId: string,
    points: ScorePoints,
    reason?: string
  ) => Promise<boolean>;
  isSubmitting?: boolean;
  testID?: string;
}

/**
 * Get point button style based on value
 */
export function getPointButtonStyle(
  points: number,
  isSelected: boolean
): { backgroundColor: string; textColor: string } {
  const isPositive = points > 0;

  if (isSelected) {
    return {
      backgroundColor: isPositive ? COLORS.success : COLORS.error,
      textColor: COLORS.white,
    };
  }

  return {
    backgroundColor: isPositive ? `${COLORS.success}20` : `${COLORS.error}20`,
    textColor: isPositive ? COLORS.success : COLORS.error,
  };
}

/**
 * Format point value for display
 */
export function formatPointValue(points: number): string {
  if (points > 0) return `+${points}`;
  return String(points);
}

export function AddScoreEntry({
  crewMembers,
  currentUserId,
  onSubmit,
  isSubmitting = false,
  testID,
}: AddScoreEntryProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<ScorePoints | null>(
    null
  );
  const [reason, setReason] = useState('');

  // Filter out current user (captain) from crew members
  const eligibleMembers = crewMembers.filter((m) => m.id !== currentUserId);

  const canSubmit = selectedUserId && selectedPoints !== null && !isSubmitting;

  const handleSubmit = async () => {
    if (!selectedUserId || selectedPoints === null) return;

    const success = await onSubmit(
      selectedUserId,
      selectedPoints,
      reason.trim() || undefined
    );

    if (success) {
      // Reset form
      setSelectedUserId(null);
      setSelectedPoints(null);
      setReason('');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {/* Crew Member Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Crew Member</Text>
        <View style={styles.crewGrid}>
          {eligibleMembers.map((member) => {
            const isSelected = selectedUserId === member.id;
            return (
              <Pressable
                key={member.id}
                style={[
                  styles.crewButton,
                  isSelected && styles.crewButtonSelected,
                ]}
                onPress={() => setSelectedUserId(member.id)}
              >
                <View
                  style={[
                    styles.crewColorDot,
                    { backgroundColor: member.color },
                  ]}
                />
                <Text
                  style={[
                    styles.crewName,
                    isSelected && styles.crewNameSelected,
                  ]}
                  numberOfLines={1}
                >
                  {member.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Points Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Points</Text>
        <View style={styles.pointsRow}>
          {SCORE_POINTS.map((points) => {
            const isSelected = selectedPoints === points;
            const style = getPointButtonStyle(points, isSelected);

            return (
              <Pressable
                key={points}
                style={[
                  styles.pointButton,
                  { backgroundColor: style.backgroundColor },
                ]}
                onPress={() => setSelectedPoints(points)}
              >
                <Text style={[styles.pointText, { color: style.textColor }]}>
                  {formatPointValue(points)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Reason Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reason (optional)</Text>
        <TextInput
          style={styles.reasonInput}
          placeholder="Why are you giving these points?"
          placeholderTextColor={COLORS.textMuted}
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={200}
        />
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={isSubmitting}
      >
        Add Score
      </Button>

      {/* Info Note */}
      <Text style={styles.infoNote}>
        Note: Scores cannot be deleted. Add opposite points to compensate.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  crewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  crewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  crewButtonSelected: {
    borderColor: COLORS.coral,
    backgroundColor: `${COLORS.coral}10`,
  },
  crewColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  crewName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  crewNameSelected: {
    color: COLORS.coral,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  pointButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  pointText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  reasonInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
});
