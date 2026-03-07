/**
 * Privacy Policy Screen (Brutalist)
 *
 * Displays privacy policy in Croatian.
 * GDPR compliant information about data collection and storage.
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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

export default function PrivacyScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>PRIVATNOST</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRAVILA PRIVATNOSTI</Text>
          <Text style={styles.lastUpdated}>Zadnje ažurirano: Ožujak 2026.</Text>
          <Text style={styles.paragraph}>
            AhoyCrew aplikacija poštuje vašu privatnost. Ovaj dokument objašnjava
            koje podatke prikupljamo, kako ih koristimo i kako ih štitimo.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KOJI PODACI SE PRIKUPLJAJU</Text>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Email adresa</Text>
              <Text style={styles.listDesc}>
                Koristi se za prijavu i identifikaciju korisnika.
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Podaci o bookingu</Text>
              <Text style={styles.listDesc}>
                Datumi, marine, broj gostiju, bilješke.
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Troškovi i računi</Text>
              <Text style={styles.listDesc}>
                Iznosi, kategorije, slike računa, nazivi trgovina.
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>APA i napojnice</Text>
              <Text style={styles.listDesc}>
                Primljeni predujmovi i podjela napojnica.
              </Text>
            </View>
          </View>
        </View>

        {/* Data Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GDJE SE PODACI ČUVAJU</Text>
          <Text style={styles.paragraph}>
            Svi podaci pohranjeni su na Google Cloud platformi putem Firebase servisa:
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Firebase Firestore</Text>
            <Text style={styles.infoBoxDesc}>
              Baza podataka za korisnike, bookinge, troškove i postavke.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Firebase Storage</Text>
            <Text style={styles.infoBoxDesc}>
              Pohrana slika računa s enkripcijom.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Firebase Authentication</Text>
            <Text style={styles.infoBoxDesc}>
              Sigurna autentifikacija putem magic linka.
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Serveri se nalaze u EU regiji (europe-west1) u skladu s GDPR regulativom.
          </Text>
        </View>

        {/* Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TKO IMA PRISTUP</Text>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Vaša posada</Text>
              <Text style={styles.listDesc}>
                Članovi iste sezone vide dijeljene podatke (bookinge, troškove, APA).
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Privatni podaci</Text>
              <Text style={styles.listDesc}>
                Osobni prihodi (kada budu implementirani) vidljivi su samo vama.
              </Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.listBullet}>●</Text>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Administratori</Text>
              <Text style={styles.listDesc}>
                Pristup samo za tehničku podršku, uz vašu privolu.
              </Text>
            </View>
          </View>
        </View>

        {/* GDPR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GDPR PRAVA</Text>
          <Text style={styles.paragraph}>
            Sukladno GDPR regulativi (Opća uredba o zaštiti podataka), imate pravo:
          </Text>

          <View style={styles.gdprList}>
            <Text style={styles.gdprItem}>✓ Pristup svojim podacima</Text>
            <Text style={styles.gdprItem}>✓ Ispravak netočnih podataka</Text>
            <Text style={styles.gdprItem}>✓ Brisanje podataka ("pravo na zaborav")</Text>
            <Text style={styles.gdprItem}>✓ Prijenos podataka (data portability)</Text>
            <Text style={styles.gdprItem}>✓ Povlačenje privole u bilo kojem trenutku</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KONTAKT</Text>
          <Text style={styles.paragraph}>
            Za sva pitanja vezana uz privatnost ili ostvarivanje GDPR prava,
            kontaktirajte nas na:
          </Text>

          <View style={styles.contactBox}>
            <Text style={styles.contactEmail}>privacy@ahoycrew.app</Text>
          </View>

          <Text style={styles.paragraph}>
            Odgovorit ćemo u roku od 30 dana od primitka zahtjeva.
          </Text>
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

  // Section
  section: {
    backgroundColor: COLORS.card,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.brut,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  lastUpdated: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    marginBottom: SPACING.md,
  },
  paragraph: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },

  // List Items
  listItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  listBullet: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xxs,
  },
  listDesc: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
    lineHeight: 18,
  },

  // Info Box
  infoBox: {
    backgroundColor: COLORS.muted,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoBoxTitle: {
    fontFamily: FONTS.display,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xxs,
  },
  infoBoxDesc: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.mutedForeground,
  },

  // GDPR List
  gdprList: {
    backgroundColor: COLORS.accent,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  gdprItem: {
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.foreground,
    marginBottom: SPACING.xs,
  },

  // Contact
  contactBox: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDERS.normal,
    borderColor: COLORS.foreground,
    borderRadius: BORDER_RADIUS.none,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  contactEmail: {
    fontFamily: FONTS.monoBold,
    fontSize: TYPOGRAPHY.sizes.large,
    color: COLORS.white,
  },

  // Pressed
  pressed: {
    transform: ANIMATION.pressedTransform,
  },
});
