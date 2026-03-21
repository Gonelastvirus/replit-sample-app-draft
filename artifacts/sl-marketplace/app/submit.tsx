import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
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
const AMENITY_OPTIONS = [
  "parking",
  "balcony",
  "garden",
  "water",
  "internet",
  "road_access",
  "solar",
  "security",
  "terrace",
  "lift",
];

async function uploadFile(uri: string, name: string, type: string): Promise<string> {
  const formData = new FormData();
  formData.append("files", { uri, name, type } as any);

  const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });

  if (!res.ok) {
    let errorText = "";
    try { errorText = await res.text(); } catch {}
    throw new Error(`Upload failed (${res.status}): ${errorText || "no details"}`);
  }

  const json = await res.json();
  return json.urls?.[0] || json.url || json[0] || "";
}

async function optimizeImage(originalUri: string, targetMaxMB = 1.5): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(originalUri);
  const sizeMB = fileInfo.size / (1024 * 1024);

  if (sizeMB > 5) throw new Error("Image too large, please select smaller images (<5 MB).");

  let quality = 0.85;
  const minQuality = 0.45;
  const qualityStep = 0.1;

  let result = await ImageManipulator.manipulateAsync(
    originalUri,
    [{ resize: { width: 1200 } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );

  let currentUri = result.uri;

  while (quality > minQuality) {
    const info = await FileSystem.getInfoAsync(currentUri);
    const sizeMB2 = info.size / (1024 * 1024);
    if (sizeMB2 <= targetMaxMB) break;

    quality = Math.max(minQuality, quality - qualityStep);
    result = await ImageManipulator.manipulateAsync(
      originalUri,
      [{ resize: { width: 1200 } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    currentUri = result.uri;
  }

  return currentUri;
}

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
    latitude: "",
    longitude: "",
    ownerName: user?.name || "",
    ownerPhone: user?.phone || "",
    ownerWhatsapp: "",
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleAmenity = (amenity: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );

  const handleImageResult = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const optimizedUris: string[] = [];
    for (const asset of assets) {
      try {
        const optimized = await optimizeImage(asset.uri);
        optimizedUris.push(optimized);
      } catch (err: any) {
  console.warn(err);

  if (err.message?.toLowerCase().includes("large")) {
    Alert.alert("Image too large", err.message);
  } else {
    Alert.alert("Error", "Failed to process image");
  }
}
    }
    setPhotoUris((prev) => [...prev, ...optimizedUris].slice(0, 10));
  };

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission required", "Please allow access to your photo library.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.88,
      selectionLimit: 10,
    });

    if (!result.canceled) await handleImageResult(result.assets);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission required", "Please allow camera access.");

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.88,
    });

    if (!result.canceled) await handleImageResult(result.assets);
  };

  const removePhoto = (index: number) => setPhotoUris((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.priceNpr || !form.ownerName.trim() || !form.ownerPhone.trim()) {
      return Alert.alert("Error", "Please fill in all required fields");
    }
    if (!user) {
      return Alert.alert(t("loginRequired"), t("loginToFavorite"), [
        { text: "Cancel", style: "cancel" },
        { text: t("login"), onPress: () => router.push("/auth") },
      ]);
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload images in parallel
      const uploadedPhotos = await Promise.all(
        photoUris.map(async (uri) => {
          const ext = (uri.split(".").pop() || "jpg").toLowerCase();
          const mimeType = ext === "jpg" || ext === "jpeg" ? "jpeg" : ext;
          const filename = `listing-photo-${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
          return await uploadFile(uri, filename, `image/${mimeType}`);
        })
      );

      const payload = {
        ...form,
        priceNpr: Number(form.priceNpr),
        areaDhur: form.areaDhur ? Number(form.areaDhur) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        buildYear: form.buildYear ? Number(form.buildYear) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        amenities: selectedAmenities,
        photos: uploadedPhotos,
      };

      const res = await fetch(`${BASE_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = "";
        try { errMsg = await res.text(); } catch {}
        throw new Error(`Failed to create listing (${res.status}): ${errMsg || "no message"}`);
      }

      Alert.alert("Success", t("submitted") || "Listing submitted successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error("Submission error:", err);
      Alert.alert("Error", err.message || "Failed to submit listing. Please try again.");
    } finally {
      setLoading(false);
      setUploading(false);
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

<ScrollView 
showsVerticalScrollIndicator={false} 
contentContainerStyle={[styles.form, { paddingBottom: 80 }]}
>
        {/* Listing Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("listingType")} *</Text>
          <View style={styles.chips}>
            {LISTING_TYPES.map((lt) => (
              <Pressable
                key={lt}
                onPress={() => update("listingType", lt)}
                style={[
                  styles.chip,
                  {
                    borderColor: form.listingType === lt ? colors.primary : colors.border,
                    backgroundColor: form.listingType === lt ? colors.primary + "15" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: form.listingType === lt ? colors.primary : colors.textSecondary },
                  ]}
                >
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
                style={[
                  styles.chip,
                  {
                    borderColor: form.propertyType === pt ? colors.primary : colors.border,
                    backgroundColor: form.propertyType === pt ? colors.primary + "15" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: form.propertyType === pt ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {t(pt)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Title */}
        <InputField
          label={`${t("title")} *`}
          value={form.title}
          onChangeText={(v) => update("title", v)}
          placeholder="e.g. Modern House in Kathmandu"
          colors={colors}
        />

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("descriptionLabel")} *</Text>
          <TextInput
            style={[
              styles.textarea,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
            ]}
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
              {NEPAL_DISTRICTS.slice(0,25).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => update("district", d)}
                  style={[
                    styles.chip,
                    {
                      borderColor: form.district === d ? colors.primary : colors.border,
                      backgroundColor: form.district === d ? colors.primary + "25" : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: form.district === d ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Price */}
        <InputField
          label={`${t("price")} *`}
          value={form.priceNpr}
          onChangeText={(v) => update("priceNpr", v)}
          placeholder="e.g. 5000000"
          keyboardType="numeric"
          colors={colors}
        />

        {/* Area (Dhur) */}
        <InputField
          label={t("areaLabel")}
          value={form.areaDhur}
          onChangeText={(v) => update("areaDhur", v)}
          placeholder="e.g. 4.5"
          keyboardType="numeric"
          colors={colors}
        />

        {/* Bedrooms & Bathrooms */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <InputField
              label={t("bedrooms")}
              value={form.bedrooms}
              onChangeText={(v) => update("bedrooms", v)}
              placeholder="e.g. 3"
              keyboardType="numeric"
              colors={colors}
            />
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              label={t("baths")}
              value={form.bathrooms}
              onChangeText={(v) => update("bathrooms", v)}
              placeholder="e.g. 2"
              keyboardType="numeric"
              colors={colors}
            />
          </View>
        </View>

        {/* Build Year */}
        <InputField
          label={t("builtYear")}
          value={form.buildYear}
          onChangeText={(v) => update("buildYear", v)}
          placeholder="e.g. 2020"
          keyboardType="numeric"
          colors={colors}
        />

        {/* Coordinates */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Location Coordinates (optional)</Text>
          <View style={[styles.coordHint, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
            <Feather name="map-pin" size={13} color={colors.primary} />
            <Text style={[styles.coordHintText, { color: colors.textSecondary }]}>
              Open Google Maps, long-press the property location, then copy the latitude & longitude shown at the top.
            </Text>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Latitude"
                value={form.latitude}
                onChangeText={(v) => update("latitude", v)}
                placeholder="e.g. 27.7172"
                keyboardType="numeric"
                colors={colors}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Longitude"
                value={form.longitude}
                onChangeText={(v) => update("longitude", v)}
                placeholder="e.g. 85.3240"
                keyboardType="numeric"
                colors={colors}
              />
            </View>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Photos (up to 4) – automatically resized & optimized
          </Text>

          {photoUris.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={styles.photoStrip}>
                {photoUris.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrap}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <Pressable
                      onPress={() => removePhoto(idx)}
                      style={styles.photoRemove}
                      hitSlop={6}
                    >
                      <Feather name="x" size={12} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.row}>
            <Pressable
              onPress={pickPhotos}
              style={[styles.mediaBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
            >
              <Feather name="image" size={18} color={colors.primary} />
              <Text style={[styles.mediaBtnText, { color: colors.text }]}>From Gallery</Text>
            </Pressable>

            <Pressable
              onPress={takePhoto}
              style={[styles.mediaBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
            >
              <Feather name="camera" size={18} color={colors.primary} />
              <Text style={[styles.mediaBtnText, { color: colors.text }]}>Take Photo</Text>
            </Pressable>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t("amenities")}</Text>
          <View style={styles.chips}>
            {AMENITY_OPTIONS.map((a) => (
              <Pressable
                key={a}
                onPress={() => toggleAmenity(a)}
                style={[
                  styles.chip,
                  {
                    borderColor: selectedAmenities.includes(a) ? colors.primary : colors.border,
                    backgroundColor: selectedAmenities.includes(a) ? colors.primary + "15" : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedAmenities.includes(a) ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {t(a)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Owner / Contact Info */}
        <View style={[styles.ownerSection, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <Text style={[styles.ownerSectionTitle, { color: colors.text }]}>Owner / Contact Info</Text>
          <InputField
            label={`${t("name")} *`}
            value={form.ownerName}
            onChangeText={(v) => update("ownerName", v)}
            placeholder="Owner name"
            colors={colors}
          />
          <InputField
            label={`${t("phone")} *`}
            value={form.ownerPhone}
            onChangeText={(v) => update("ownerPhone", v)}
            placeholder="+977-98XXXXXXXX"
            keyboardType="phone-pad"
            colors={colors}
          />
          <InputField
            label="WhatsApp (optional)"
            value={form.ownerWhatsapp}
            onChangeText={(v) => update("ownerWhatsapp", v)}
            placeholder="+977-98XXXXXXXX"
            keyboardType="phone-pad"
            colors={colors}
          />
        </View>

        {/* Review Note */}
        <View style={[styles.note, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Your listing will be reviewed by our admin team before being published. This usually takes 1-2 business days.
          </Text>
        </View>

   {/* Submit button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitBtnText}>{uploading ? "Uploading photos..." : t("submitting") || "Submitting..."}</Text>
            </>
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>{t("submit") || "Submit Listing"}</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  colors,
}: {
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
  coordHint: { flexDirection: "row", gap: 7, padding: 11, borderRadius: 10, borderWidth: 1, alignItems: "flex-start", marginBottom: 12 },
  coordHintText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  photoStrip: { flexDirection: "row", gap: 8 },
  photoThumbWrap: { position: "relative" },
  photoThumb: { width: 72, height: 72, borderRadius: 10 },
  photoRemove: { position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
  mediaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, borderStyle: "dashed" },
  mediaBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
