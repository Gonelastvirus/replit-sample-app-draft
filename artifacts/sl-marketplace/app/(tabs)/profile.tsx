import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";

export default function ProfileScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { user, clearAuth, isAdmin, language, setLanguage } = useApp();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleLogout = () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: t("logout"), style: "destructive", onPress: clearAuth },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <View style={styles.guestContainer}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
            <Feather name="user" size={40} color={colors.textTertiary} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>Join SL Housing & Construction</Text>
          <Text style={[styles.guestDesc, { color: colors.textSecondary }]}>
            Create an account to save favorites and list your properties
          </Text>
          <Pressable
            onPress={() => router.push("/auth")}
            style={[styles.authBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.authBtnText}>{t("login")} / {t("register")}</Text>
          </Pressable>
          <View style={styles.langRow}>
            <Text style={[styles.langLabel, { color: colors.textSecondary }]}>Language</Text>
            <Pressable
              onPress={() => setLanguage(language === "en" ? "ne" : "en")}
              style={[styles.langToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.langToggleText, { color: colors.primary }]}>
                {language === "en" ? "नेपाली" : "English"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { paddingTop: topPadding + 20, backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
        {isAdmin ? (
          <View style={[styles.adminBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
            <Feather name="shield" size={12} color={colors.primary} />
            <Text style={[styles.adminBadgeText, { color: colors.primary }]}>Admin</Text>
          </View>
        ) : null}
      </View>

      {/* Menu Items */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <MenuItem
          icon="plus-circle"
          label={t("submitListing")}
          onPress={() => router.push("/submit")}
          colors={colors}
        />
        <MenuItem
          icon="heart"
          label={t("favoritesTitle")}
          onPress={() => router.push("/(tabs)/profile")}
          colors={colors}
        />
        {isAdmin ? (
          <MenuItem
            icon="shield"
            label={t("adminPanel")}
            onPress={() => router.push("/(tabs)/admin-tab")}
            colors={colors}
            accent
          />
        ) : null}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, marginTop: 12 }]}>
        <MenuItem
          icon="globe"
          label="Language"
          value={language === "en" ? "English" : "नेपाली"}
          onPress={() => setLanguage(language === "en" ? "ne" : "en")}
          colors={colors}
        />
        <MenuItem
          icon="info"
          label={t("about")}
          onPress={() => router.push("/about")}
          colors={colors}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, marginTop: 12 }]}>
        <Pressable onPress={handleLogout} style={styles.menuItem}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={[styles.menuLabel, { color: colors.error }]}>{t("logout")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, value, onPress, colors, accent }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  accent?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}>
      <Feather name={icon} size={20} color={accent ? colors.primary : colors.text} />
      <Text style={[styles.menuLabel, { color: accent ? colors.primary : colors.text, flex: 1 }]}>{label}</Text>
      {value ? (
        <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>
      ) : null}
      <Feather name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  guestTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  guestDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  authBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginTop: 8, width: "100%", alignItems: "center" },
  authBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  langRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  langLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  langToggle: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  langToggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  profileHeader: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  userName: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  userEmail: { fontSize: 14, fontFamily: "Inter_400Regular" },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  adminBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { borderRadius: 16, marginHorizontal: 16, marginTop: 16, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 0 },
  menuLabel: { fontSize: 16, fontFamily: "Inter_500Medium" },
  menuValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
