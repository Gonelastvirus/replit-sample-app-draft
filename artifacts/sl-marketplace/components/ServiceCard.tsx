import { Feather } from "@expo/vector-icons";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import * as Haptics from "expo-haptics";

type Service = {
  id: number;
  businessName: string;
  serviceType: string;
  phone: string;
  whatsapp?: string | null;
  district: string;
  description?: string | null;
};

const SERVICE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  plumber: "droplets",
  brick_supplier: "layers",
  electrician: "zap",
  cement_supplier: "box",
  contractor: "tool",
  hardware_store: "shopping-bag",
  sand_gravel_supplier: "globe",
  tile_supplier: "grid",
  iron_supplier: "anchor",
  interior_designer: "home",
};

const SERVICE_COLORS: Record<string, string> = {
  plumber: "#2196F3",
  brick_supplier: "#E64A19",
  electrician: "#FFC107",
  cement_supplier: "#607D8B",
  contractor: "#4CAF50",
  hardware_store: "#9C27B0",
  sand_gravel_supplier: "#795548",
  tile_supplier: "#00BCD4",
  iron_supplier: "#455A64",
  interior_designer: "#E91E63",
};

type Props = {
  service: Service;
};

export function ServiceCard({ service }: Props) {
  const colors = useColors();
  const t = useT();
  const icon = SERVICE_ICONS[service.serviceType] || "briefcase";
  const accentColor = SERVICE_COLORS[service.serviceType] || colors.primary;

  const handleCall = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${service.phone}`);
  };

  const handleWhatsApp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const num = (service.whatsapp || service.phone).replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${num}`);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconWrap, { backgroundColor: accentColor + "18" }]}>
        <Feather name={icon} size={22} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{service.businessName}</Text>
        <Text style={[styles.type, { color: accentColor }]}>{t(service.serviceType)}</Text>
        <View style={styles.row}>
          <Feather name="map-pin" size={11} color={colors.textTertiary} />
          <Text style={[styles.district, { color: colors.textTertiary }]}>{service.district}</Text>
        </View>
        {service.description ? (
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>{service.description}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleCall} style={[styles.actionBtn, { backgroundColor: colors.primary }]} hitSlop={6}>
          <Feather name="phone" size={16} color="#fff" />
        </Pressable>
        {service.whatsapp ? (
          <Pressable onPress={handleWhatsApp} style={[styles.actionBtn, { backgroundColor: "#25D366" }]} hitSlop={6}>
            <Feather name="message-circle" size={16} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  type: { fontSize: 12, fontFamily: "Inter_500Medium" },
  row: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  district: { fontSize: 12, fontFamily: "Inter_400Regular" },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 17 },
  actions: { gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
