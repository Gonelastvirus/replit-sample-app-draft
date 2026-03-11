import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { useApp } from "@/context/AppContext";
import { BASE_URL } from "@/hooks/useApi";
import { NEPAL_DISTRICTS } from "@/constants/districts";

const LISTING_TYPES = ["sale", "rent"] as const;
const PROPERTY_TYPES = ["house", "land", "apartment", "commercial"] as const;
const AMENITY_OPTIONS = ["parking", "balcony", "garden", "water", "internet", "road_access", "solar", "security", "terrace", "lift"];

export default function SubmitScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { user, token } = useApp();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [form, setForm] = useState({
    title: "",
    description: "",
    listingType: "sale" as typeof LISTING_TYPES[number],
    propertyType: "house" as typeof PROPERTY_TYPES[number],
    district: "Kathmandu",
    priceNpr: "",
    areaDhur: "",
    bedrooms: "",
    bathrooms: "",
    buildYear: "",
    ownerName: user?.name || "",
    ownerPhone: user?.phone || "",
    ownerWhatsapp: "",
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.priceNpr || !form.ownerName || !form.ownerPhone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (!user) {
      Alert.alert(t("loginRequired"), t("loginToFavorite"), [
        { text: "Cancel", style: "cancel" },
        { text: t("login"), onPress: () => router.push("/auth") },
      ]);
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...form,
        priceNpr: Number(form.priceNpr),
        areaDhur: form.areaDhur ? Number(form.areaDhur) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        buildYear: form.buildYear ? Number(form.buildYear) : null,
        amenities: selectedAmenities,
        photos: [],
      };
      const res = await fetch(`${BASE_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to submit");
      Alert.alert("Success!", t("submitted"), [{ text: "OK", onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert("Error", "Failed to submit listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("submitListing")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.form, { paddingBottom: 80 }]}>
        {/* Listing Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("listingType")} *</Text>
          <View style={styles.chips}>
            {LISTING_TYPES.map((lt) => (
              <Pressable
                key={lt}
                onPress={() => update("listingType", lt)}
                style={[styles.chip, { borderColor: form.listingType === lt ? colors.primary : colors.border, backgroundColor: form.listingType === lt ? colors.primary + "15" : "transparent" }]}
              >
                <Text style={[styles.chipText, { color: form.listingType === lt ? colors.primary : colors.textSecondary }]}>
                  {t("for" + lt.charAt(0).toUpperCase() + lt.slice(1))}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("propertyType")} *</Text>
          <View style={styles.chips}>
            {PROPERTY_TYPES.map((pt) => (
              <Pressable
                key={pt}
                onPress={() => update("propertyType", pt)}
                style={[styles.chip, { borderColor: form.propertyType === pt ? colors.primary : colors.border, backgroundColor: form.propertyType === pt ? colors.primary + "15" : "transparent" }]}
              >
                <Text style={[styles.chipText, { color: form.propertyType === pt ? colors.primary : colors.textSecondary }]}>{t(pt)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title */}
        <InputField label={`${t("title")} *`} value={form.title} onChangeText={(v) => update("title", v)} placeholder="e.g. Modern House in Kathmandu" colors={colors} />

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("descriptionLabel")} *</Text>
          <TextInput
            style={[styles.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
            value={form.description}
            onChangeText={(v) => update("description", v)}
            placeholder="Describe the property..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* District */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("district")} *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {NEPAL_DISTRICTS.slice(0, 15).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => update("district", d)}
                  style={[styles.chip, { borderColor: form.district === d ? colors.primary : colors.border, backgroundColor: form.district === d ? colors.primary + "15" : "transparent" }]}
                >
                  <Text style={[styles.chipText, { color: form.district === d ? colors.primary : colors.textSecondary }]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Price */}
        <InputField label={`${t("price")} *`} value={form.priceNpr} onChangeText={(v) => update("priceNpr", v)} placeholder="e.g. 5000000" keyboardType="numeric" colors={colors} />

        {/* Area */}
        <InputField label={t("areaLabel")} value={form.areaDhur} onChangeText={(v) => update("areaDhur", v)} placeholder="e.g. 4.5" keyboardType="numeric" colors={colors} />

        {/* Beds & Baths */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <InputField label={t("bedrooms")} value={form.bedrooms} onChangeText={(v) => update("bedrooms", v)} placeholder="e.g. 3" keyboardType="numeric" colors={colors} />
          </View>
          <View style={{ flex: 1 }}>
            <InputField label={t("baths")} value={form.bathrooms} onChangeText={(v) => update("bathrooms", v)} placeholder="e.g. 2" keyboardType="numeric" colors={colors} />
          </View>
        </View>

        {/* Build Year */}
        <InputField label={t("builtYear")} value={form.buildYear} onChangeText={(v) => update("buildYear", v)} placeholder="e.g. 2020" keyboardType="numeric" colors={colors} />

        {/* Amenities */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("amenities")}</Text>
          <View style={styles.chips}>
            {AMENITY_OPTIONS.map((a) => (
              <Pressable
                key={a}
                onPress={() => toggleAmenity(a)}
                style={[styles.chip, { borderColor: selectedAmenities.includes(a) ? colors.primary : colors.border, backgroundColor: selectedAmenities.includes(a) ? colors.primary + "15" : "transparent" }]}
              >
                <Text style={[styles.chipText, { color: selectedAmenities.includes(a) ? colors.primary : colors.textSecondary }]}>{t(a)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Owner Info */}
        <View style={[styles.ownerSection, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <Text style={[styles.ownerSectionTitle, { color: colors.text }]}>Owner / Contact Info</Text>
          <InputField label={`${t("name")} *`} value={form.ownerName} onChangeText={(v) => update("ownerName", v)} placeholder="Owner name" colors={colors} />
          <InputField label={`${t("phone")} *`} value={form.ownerPhone} onChangeText={(v) => update("ownerPhone", v)} placeholder="+977-98XXXXXXXX" keyboardType="phone-pad" colors={colors} />
          <InputField label="WhatsApp (optional)" value={form.ownerWhatsapp} onChangeText={(v) => update("ownerWhatsapp", v)} placeholder="+977-98XXXXXXXX" keyboardType="phone-pad" colors={colors} />
        </View>

        {/* Note */}
        <View style={[styles.note, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Your listing will be reviewed by our admin team before being published. This usually takes 1-2 business days.
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>{loading ? t("submitting") : t("submit")}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InputField({ label, value, onChangeText, placeholder, keyboardType, colors }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType || "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  form: { padding: 20, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 7, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  textarea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 100, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  row: { flexDirection: "row", gap: 12 },
  ownerSection: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 4, marginBottom: 16 },
  ownerSectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  note: { flexDirection: "row", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start", marginBottom: 8 },
  noteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, gap: 8 },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
