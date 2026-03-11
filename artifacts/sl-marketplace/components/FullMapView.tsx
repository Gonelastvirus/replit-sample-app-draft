import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Property = {
  id: number;
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  properties: Property[];
};

export default function FullMapView({ properties }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundTertiary }]}>
      <Feather name="map" size={48} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>Map View</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>
        Interactive map is available on iOS and Android devices. Download the app to explore properties on the map.
      </Text>
      <Text style={[styles.count, { color: colors.primary }]}>
        {properties.length} properties with location data
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  desc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24 },
  count: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
