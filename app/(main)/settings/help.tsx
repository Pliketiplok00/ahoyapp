/**
 * Help Screen (Brutalist)
 *
 * FAQ-style help with common questions and answers.
 * Brutalist styling with expandable sections.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import {
  COLORS,
  SHADOWS,
  BORDERS,
  SPACING,
  TYPOGRAPHY,
  FONTS,
  BORDER_RADIUS,
  ANIMATION,
} from '@/config/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Kako dodati trošak?',
    answer:
      'Otvorite booking, pritisnite "APA & TROŠKOVI", zatim pritisnite + gumb. ' +
      'Možete slikati račun (kamera će automatski izvući podatke) ili unijeti ručno bez računa. ' +
      'Nakon unosa, trošak se automatski dodaje u listu i oduzima od APA iznosa.',
  },
  {
    question: 'Kako pozvati posadu?',
    answer:
      'Idite na Postavke → Upravljanje posadom → "POZOVI ČLANA". ' +
      'Unesite email adresu i dobit ćete jedinstveni kod za dijeljenje. ' +
      'Kod možete poslati putem SMS-a, WhatsAppa ili emaila. ' +
      'Pozvani član unosi kod na ekranu "Pridruži se posadi".',
  },
  {
    question: 'Kako exportati izvještaj?',
    answer:
      'Otvorite završeni booking i pritisnite "EXPORT". ' +
      'Generira se Excel datoteka sa svim troškovima, APA unosima i sažetkom. ' +
      'Datoteku možete podijeliti emailom ili spremiti na uređaj. ' +
      'Svi iznosi su formatirani u hrvatskom formatu (1.234,56 €).',
  },
  {
    question: 'Što je APA?',
    answer:
      'APA (Advance Provisioning Allowance) je predujam koji gosti daju na početku chartera ' +
      'za pokrivanje troškova hrane, goriva, marina i ostalih izdataka. ' +
      'Na kraju chartera radi se rekoncilijacija — usporedba primljenog APA iznosa s ' +
      'utrošenim sredstvima. Razlika se vraća gostima ili nadoplaćuje.',
  },
  {
    question: 'Kako radi podjela napojnice?',
    answer:
      'Kapetan postavlja postotak za svakog člana posade u Postavke → Podjela napojnica. ' +
      'Može odabrati jednaku podjelu (svi dobiju isti postotak) ili prilagođenu podjelu. ' +
      'Ukupan zbroj mora biti 100%. Kad se unese napojnica na bookingu, ' +
      'automatski se izračunava udio svakog člana.',
  },
  {
    question: 'Kontakt za pomoć',
    answer:
      'Za tehničku podršku ili pitanja o aplikaciji, kontaktirajte nas na:\n\n' +
      'support@ahoycrew.app\n\n' +
      'Odgovaramo u roku od 24 sata radnim danima.',
  },
];

function FAQItemComponent({ item, isExpanded, onToggle }: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.faqItem,
        isExpanded && styles.faqItemExpanded,
        pressed && styles.pressed,
      ]}
      onPress={onToggle}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <View style={[styles.faqToggle, isExpanded && styles.faqToggleExpanded]}>
          <Text style={styles.faqToggleText}>{isExpanded ? '−' : '+'}</Text>
        </View>
      </View>
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@ahoycrew.app?subject=AhoyCrew%20Podrška');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>POMOĆ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>ČESTA PITANJA</Text>
          <Text style={styles.introText}>
            Pronađite odgovore na najčešća pitanja o korištenju AhoyCrew aplikacije.
          </Text>
        </View>

        {/* FAQ List */}
        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item, index) => (
            <FAQItemComponent
              key={index}
              item={item}
              isExpanded={expandedIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>TREBATE DODATNU POMOĆ?</Text>
          <Text style={styles.contactText}>
            Ako niste pronašli odgovor na svoje pitanje, kontaktirajte našu podršku.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.contactButton, pressed && styles.pressed]}
            onPress={handleContactSupport}
          >
            <Text style={styles.contactButtonIcon}>📧</Text>
            <Text style={styles.contactButtonText}>KONTAKTIRAJ PODRŠKU</Text>
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>
    </View>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutSm,
  },
  backButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },

  // ScrollView
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },

  // Intro
  introSection: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  introTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  introText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.mutedForeground,
    lineHeight: 22,
  },

  // FAQ List
  faqList: {
    gap: SPACING.sm,
  },

  // FAQ Item
  faqItem: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    ...SHADOWS.brutSm,
  },
  faqItemExpanded: {
    ...SHADOWS.brut,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },
  faqToggle: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqToggleExpanded: {
    backgroundColor: COLORS.primary,
  },
  faqToggleText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    color: COLORS.foreground,
  },
  faqAnswerContainer: {
    borderTopWidth: BORDERS.thin,
    borderTopColor: COLORS.muted,
    padding: SPACING.md,
    backgroundColor: COLORS.muted,
  },
  faqAnswer: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    lineHeight: 22,
  },

  // Contact Section
  contactSection: {
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.brut,
  },
  contactTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  contactText: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: SPACING.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.brutSm,
  },
  contactButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  contactButtonText: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
