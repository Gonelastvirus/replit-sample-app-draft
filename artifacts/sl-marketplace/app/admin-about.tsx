import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BASE_URL } from "@/hooks/useApi";

type AboutContent = {
  mission: string;
  vision: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  socialLinks?: { facebook?: string | null; instagram?: string | null; twitter?: string | null };
};

export default function AdminAboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token, user } = useApp();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [form, setForm] = useState<AboutContent>({
    mission: "",
    vision: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    socialLinks: { facebook: "", instagram: "", twitter: "" },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data } = useQuery<AboutContent>({
    queryKey: ["about"],
    queryFn: () => fetch(`${BASE_URL}/about`).then((r) => r.json()),
  });

  useEffect(() => {
    if (data) {
      setForm({
        mission: data.mission || "",
        vision: data.vision || "",
        contactPhone: data.contactPhone || "",
        contactEmail: data.contactEmail || "",
        address: data.address || "",
        socialLinks: {
          facebook: data.socialLinks?.facebook || "",
          instagram: data.socialLinks?.instagram || "",
          twitter: data.socialLinks?.twitter || "",
        },
      });
    }
  }, [data]);

  const update = (key: keyof AboutContent, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const updateSocial = (key: string, val: string) =>
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: val || null } }));

  const handleSave = async () => {
    if (!form.mission || !form.vision || !form.contactPhone || !form.contactEmail) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`${BASE_URL}/about`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      qc.invalidateQueries({ queryKey: ["about"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert("Error", "Failed to save About content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.error, fontFamily: "Inter_600SemiBold" }}>Admin access required</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: topPadding + 10, borderBottomColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit About Page</Text>
        <Pressable
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          <Feather name={saved ? "check" : "save"} size={14} color="#fff" />
          <Text style={styles.saveBtnText}>{saved ? "Saved!" : loading ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.form, { paddingBottom: Platform.OS === "web" ? 118 : 80 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mission */}
        <SectionCard title="Mission & Vision" icon="target" colors={colors}>
          <Field
            label="Mission *"
            value={form.mission}
            onChangeText={(v) => update("mission", v)}
            placeholder="Our mission statement..."
            multiline
            colors={colors}
          />
          <Field
            label="Vision *"
            value={form.vision}
            onChangeText={(v) => update("vision", v)}
            placeholder="Our vision statement..."
            multiline
            colors={colors}
          />
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact Information" icon="phone" colors={colors}>
          <Field
            label="Phone *"
            value={form.contactPhone}
            onChangeText={(v) => update("contactPhone", v)}
            placeholder="+977-9800000000"
            keyboardType="phone-pad"
            colors={colors}
          />
          <Field
            label="Email *"
            value={form.contactEmail}
            onChangeText={(v) => update("contactEmail", v)}
            placeholder="info@example.com"
            keyboardType="email-address"
            colors={colors}
          />
          <Field
            label="Address"
            value={form.address}
            onChangeText={(v) => update("address", v)}
            placeholder="Kathmandu, Nepal"
            colors={colors}
          />
        </SectionCard>

        {/* Social */}
        <SectionCard title="Social Links" icon="share-2" colors={colors}>
          <Field
            label="Facebook"
            value={form.socialLinks?.facebook || ""}
            onChangeText={(v) => updateSocial("facebook", v)}
            placeholder="https://facebook.com/..."
            colors={colors}
          />
          <Field
            label="Instagram"
            value={form.socialLinks?.instagram || ""}
            onChangeText={(v) => updateSocial("instagram", v)}
            placeholder="https://instagram.com/..."
            colors={colors}
          />
          <Field
            label="Twitter / X"
            value={form.socialLinks?.twitter || ""}
            onChangeText={(v) => updateSocial("twitter", v)}
            placeholder="https://twitter.com/..."
            colors={colors}
          />
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionCard({ title, icon, colors, children }: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: colors.primary + "15" }]}>
          <Feather name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
          multiline && styles.textarea,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType || "default"}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  form: { padding: 16, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingBottom: 12 },
  cardIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  textarea: { minHeight: 90, textAlignVertical: "top", paddingTop: 11 },
});
