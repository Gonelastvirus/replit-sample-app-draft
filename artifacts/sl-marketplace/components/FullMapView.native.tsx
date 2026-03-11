import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/utils/format";

type Property = {
  id: number;
  title: string;
  district: string;
  listingType: "sale" | "rent";
  priceNpr: number;
  latitude?: number | null;
  longitude?: number | null;
  photos: string[];
};

type Props = {
  properties: Property[];
};

export default function FullMapView({ properties }: Props) {
  const colors = useColors();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = properties.find((p) => p.id === selectedId);

  return (
    <>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{ latitude: 27.7172, longitude: 85.324, latitudeDelta: 1.5, longitudeDelta: 1.5 }}
        onPress={() => setSelectedId(null)}
      >
        {properties.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude!, longitude: p.longitude! }}
            onPress={() => setSelectedId(p.id)}
          >
            <View style={[styles.markerWrap, { backgroundColor: p.listingType === "rent" ? colors.primary : colors.success }]}>
              <Text style={styles.markerText}>{formatPrice(p.priceNpr)}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      {selected ? (
        <Pressable
          style={[styles.callout, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
          onPress={() => router.push({ pathname: "/property/[id]", params: { id: selected.id } })}
        >
          {selected.photos[0] ? (
            <Image source={{ uri: selected.photos[0] }} style={styles.calloutImage} />
          ) : null}
          <View style={styles.calloutContent}>
            <Text style={[styles.calloutTitle, { color: colors.text }]} numberOfLines={2}>{selected.title}</Text>
            <View style={styles.calloutRow}>
              <Feather name="map-pin" size={12} color={colors.textSecondary} />
              <Text style={[styles.calloutDistrict, { color: colors.textSecondary }]}>{selected.district}</Text>
            </View>
            <Text style={[styles.calloutPrice, { color: colors.primary }]}>
              {formatPrice(selected.priceNpr, selected.listingType === "rent")}
            </Text>
          </View>
          <View style={styles.calloutArrow}>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
          <Pressable onPress={() => setSelectedId(null)} style={styles.closeCallout} hitSlop={10}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </Pressable>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  markerWrap: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  markerText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  callout: { position: "absolute", bottom: 32, left: 16, right: 16, borderRadius: 16, flexDirection: "row", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  calloutImage: { width: 100, height: 100 },
  calloutContent: { flex: 1, padding: 12, gap: 4 },
  calloutTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  calloutRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  calloutDistrict: { fontSize: 12, fontFamily: "Inter_400Regular" },
  calloutPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  calloutArrow: { alignSelf: "center", paddingRight: 12 },
  closeCallout: { position: "absolute", top: 8, right: 8 },
});
