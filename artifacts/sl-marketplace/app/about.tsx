import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { BASE_URL } from "@/hooks/useApi";

type AboutContent = {
  mission: string;
  vision: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  socialLinks?: { facebook?: string | null; instagram?: string | null; twitter?: string | null };
};

export default function AboutScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data } = useQuery<AboutContent>({
    queryKey: ["about"],
    queryFn: () => fetch(`${BASE_URL}/about`).then((r) => r.json()),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("about")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 118 : 80 }]}>
        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
            <Feather name="home" size={36} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>SL Marketplace</Text>
          <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
            Nepal's Real Estate & Construction Platform
          </Text>
        </View>

        {/* Mission */}
        {data?.mission ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="target" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t("mission")}</Text>
            </View>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>{data.mission}</Text>
          </View>
        ) : null}

        {/* Vision */}
        {data?.vision ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: "#2196F3" + "18" }]}>
                <Feather name="eye" size={18} color="#2196F3" />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t("vision")}</Text>
            </View>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>{data.vision}</Text>
          </View>
        ) : null}

        {/* Contact */}
        {data ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t("contactUs")}</Text>
            <Pressable onPress={() => Linking.openURL(`tel:${data.contactPhone}`)} style={styles.contactRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="phone" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.contactText, { color: colors.text }]}>{data.contactPhone}</Text>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
            <Pressable onPress={() => Linking.openURL(`mailto:${data.contactEmail}`)} style={styles.contactRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#2196F3" + "18" }]}>
                <Feather name="mail" size={16} color="#2196F3" />
              </View>
              <Text style={[styles.contactText, { color: colors.text }]}>{data.contactEmail}</Text>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
            <View style={styles.contactRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.success + "18" }]}>
                <Feather name="map-pin" size={16} color={colors.success} />
              </View>
              <Text style={[styles.contactText, { color: colors.text }]}>{data.address}</Text>
            </View>
          </View>
        ) : null}

        {/* Features */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>What We Offer</Text>
          {[
            { icon: "home", text: "Browse properties for sale and rent across Nepal" },
            { icon: "map", text: "Interactive map to explore properties by location" },
            { icon: "tool", text: "Find trusted construction service professionals" },
            { icon: "heart", text: "Save your favorite properties for easy access" },
            { icon: "globe", text: "Available in both English and Nepali" },
          ].map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Feather name={f.icon as keyof typeof Feather.glyphMap} size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 16 },
  brandSection: { alignItems: "center", gap: 12, paddingVertical: 24 },
  brandIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  brandTagline: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  card: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  cardText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  contactText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  featureText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
});
