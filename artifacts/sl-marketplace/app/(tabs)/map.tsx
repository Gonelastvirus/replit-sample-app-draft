import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { BASE_URL } from "@/hooks/useApi";
import FullMapView from "@/components/FullMapView";

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

export default function MapScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data } = useQuery<{ properties: Property[]; total: number }>({
    queryKey: ["map-properties"],
    queryFn: () => fetch(`${BASE_URL}/properties?limit=100`).then((r) => r.json()),
  });

  const propertiesWithCoords = (data?.properties || []).filter(
    (p) => p.latitude && p.longitude
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("mapView")}</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {propertiesWithCoords.length} properties
        </Text>
      </View>
      <View style={styles.mapWrap}>
        <FullMapView properties={propertiesWithCoords} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  count: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  mapWrap: { flex: 1 },
});
