import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapViewNative from "@/components/MapViewNative";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { formatPrice, getTimeAgo, AMENITY_ICONS } from "@/utils/format";
import { useApi } from "@/hooks/useApi";

const { width } = Dimensions.get("window");

type Property = {
  id: number;
  title: string;
  description: string;
  listingType: "sale" | "rent";
  propertyType: string;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  priceNpr: number;
  areaDhur?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  buildYear?: number | null;
  amenities: string[];
  photos: string[];
  videoUrl?: string | null;
  status: string;
  featured: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string | null;
  createdAt: string;
};

function VideoPlayer({ uri, colors }: { uri: string; colors: ReturnType<typeof useColors> }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  return (
    <View style={videoStyles.wrap}>
      <VideoView player={player} style={videoStyles.video} nativeControls contentFit="contain" />
    </View>
  );
}

const videoStyles = StyleSheet.create({
  wrap: { borderRadius: 16, overflow: "hidden", backgroundColor: "#000", height: 220 },
  video: { flex: 1, width: "100%" },
});

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const api = useApi();

  const [activePhoto, setActivePhoto] = useState(0);

  // Fetch property
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => api.get(`/properties/${id}`),
    enabled: !!id,
  });

  // Check if property is favorited (backend)
  const { data: favorites } = useQuery<number[]>({
    queryKey: ["favorites"],
    queryFn: () => api.get("/favorites"),
  });

  const isFavorited = property ? favorites?.includes(property.id) : false;

  // Toggle favorite via backend
  const toggleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (!property) return;
      if (isFavorited) {
        await api.del(`/favorites/${property.id}`);
      } else {
        await api.post("/favorites", { propertyId: property.id });
      }
      queryClient.invalidateQueries(["favorites"]);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleCall = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (property) Linking.openURL(`tel:${property.ownerPhone}`);
  };

  const handleWhatsApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (property) {
      const num = (property.ownerWhatsapp || property.ownerPhone).replace(/[^0-9]/g, "");
      Linking.openURL(`https://wa.me/${num}`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Feather name="loader" size={24} color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t("propertyNotFound") || "Property not found"}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>{t("goBack") || "Go Back"}</Text>
        </Pressable>
      </View>
    );
  }

  const isRent = property.listingType === "rent";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photo Gallery */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setActivePhoto(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {(property.photos.length > 0 ? property.photos : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]).map(
              (photo, idx) => (
                <Image key={idx} source={{ uri: photo }} style={[styles.photo, { width }]} />
              )
            )}
          </ScrollView>

          {/* Photo dots */}
          {property.photos.length > 1 && (
            <View style={styles.dots}>
              {property.photos.map((_, idx) => (
                <View key={idx} style={[styles.dot, { backgroundColor: idx === activePhoto ? "#fff" : "rgba(255,255,255,0.5)" }]} />
              ))}
            </View>
          )}

          {/* Back button */}
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 12 }]}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {/* Favorite button */}
          <Pressable onPress={toggleFavorite} style={[styles.favBtn, { top: insets.top + 12 }]}>
            <Feather name="heart" size={20} color={isFavorited ? "#FF4B4B" : "#fff"} />
          </Pressable>

          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: isRent ? colors.primary : colors.success }]}>
            <Text style={styles.typeBadgeText}>{isRent ? "RENT" : "SALE"}</Text>
          </View>
        </View>

        {/* Rest of the property content */}
        {/* ... reuse the content section from your existing screen ... */}
      </ScrollView>

      {/* Contact Buttons */}
      <View
        style={[
          styles.contactBar,
          { backgroundColor: colors.backgroundSecondary, paddingBottom: insets.bottom + 12, borderTopColor: colors.border },
        ]}
      >
        <Pressable onPress={handleCall} style={[styles.callBtn, { backgroundColor: colors.primary }]}>
          <Feather name="phone" size={20} color="#fff" />
          <Text style={styles.callBtnText}>{t("callOwner")}</Text>
        </Pressable>
        <Pressable onPress={handleWhatsApp} style={[styles.whatsappBtn, { backgroundColor: "#25D366" }]}>
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={styles.callBtnText}>{t("whatsapp")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  gallery: { position: "relative" },
  photo: { height: 300 },
  dots: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  backBtn: { position: "absolute", left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  favBtn: { position: "absolute", right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  typeBadge: { position: "absolute", bottom: 12, left: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  content: { padding: 20, gap: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  price: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  propertyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", lineHeight: 28 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: -12 },
  locationText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  timeText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  specsContainer: { flexDirection: "row", justifyContent: "space-around", borderRadius: 16, paddingVertical: 20 },
  spec: { alignItems: "center", gap: 4 },
  specValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  specLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  videoHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  description: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  amenitiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  amenityText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  mapContainer: { borderRadius: 16, overflow: "hidden", height: 200 },
  map: { flex: 1 },
  ownerCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  ownerAvatarText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  ownerName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  ownerPhone: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 2 },
  contactBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, gap: 8 },
  whatsappBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, gap: 8 },
  callBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});

