import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
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
import { NEPAL_DISTRICTS } from "@/constants/districts";

export type Filters = {
  district: string;
  listingType: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
};

export function FilterSheet({ visible, onClose, filters, onApply }: Props) {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<Filters>(filters);

  const listingTypes = ["", "sale", "rent"];
  const propertyTypes = ["", "house", "land", "apartment", "commercial"];
  const bedroomOptions = ["", "1", "2", "3", "4", "5"];

  const update = (key: keyof Filters, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleClear = () => {
    const empty: Filters = { district: "", listingType: "", propertyType: "", minPrice: "", maxPrice: "", bedrooms: "" };
    setLocal(empty);
    onApply(empty);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.backgroundSecondary, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t("filters")}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Listing Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("listingType")}</Text>
              <View style={styles.chips}>
                {listingTypes.map((lt) => (
                  <Pressable
                    key={lt}
                    onPress={() => update("listingType", lt)}
                    style={[styles.chip, { borderColor: local.listingType === lt ? colors.primary : colors.border, backgroundColor: local.listingType === lt ? colors.primary + "15" : "transparent" }]}
                  >
                    <Text style={[styles.chipText, { color: local.listingType === lt ? colors.primary : colors.textSecondary }]}>
                      {lt === "" ? t("all") : t("for" + lt.charAt(0).toUpperCase() + lt.slice(1))}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {/* Property Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("propertyType")}</Text>
              <View style={styles.chips}>
                {propertyTypes.map((pt) => (
                  <Pressable
                    key={pt}
                    onPress={() => update("propertyType", pt)}
                    style={[styles.chip, { borderColor: local.propertyType === pt ? colors.primary : colors.border, backgroundColor: local.propertyType === pt ? colors.primary + "15" : "transparent" }]}
                  >
                    <Text style={[styles.chipText, { color: local.propertyType === pt ? colors.primary : colors.textSecondary }]}>
                      {pt === "" ? t("all") : t(pt)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {/* District */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("district")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chips}>
                  {["", ...NEPAL_DISTRICTS.slice(0, 12)].map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => update("district", d)}
                      style={[styles.chip, { borderColor: local.district === d ? colors.primary : colors.border, backgroundColor: local.district === d ? colors.primary + "15" : "transparent" }]}
                    >
                      <Text style={[styles.chipText, { color: local.district === d ? colors.primary : colors.textSecondary }]}>
                        {d === "" ? t("all") : d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
            {/* Price */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("priceRange")}</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t("minPrice")}
                  placeholderTextColor={colors.textTertiary}
                  value={local.minPrice}
                  onChangeText={(v) => update("minPrice", v)}
                  keyboardType="numeric"
                />
                <Text style={{ color: colors.textTertiary, paddingHorizontal: 8 }}>—</Text>
                <TextInput
                  style={[styles.input, { flex: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t("maxPrice")}
                  placeholderTextColor={colors.textTertiary}
                  value={local.maxPrice}
                  onChangeText={(v) => update("maxPrice", v)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {/* Bedrooms */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("bedrooms")}</Text>
              <View style={styles.chips}>
                {bedroomOptions.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => update("bedrooms", b)}
                    style={[styles.chip, { borderColor: local.bedrooms === b ? colors.primary : colors.border, backgroundColor: local.bedrooms === b ? colors.primary + "15" : "transparent" }]}
                  >
                    <Text style={[styles.chipText, { color: local.bedrooms === b ? colors.primary : colors.textSecondary }]}>
                      {b === "" ? t("all") : b === "5" ? "5+" : b}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable onPress={handleClear} style={[styles.clearBtn, { borderColor: colors.border }]}>
              <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>{t("clearFilters")}</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={[styles.applyBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.applyBtnText}>{t("applyFilters")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, paddingVertical: 14 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  row: { flexDirection: "row", alignItems: "center" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", gap: 12, padding: 20, borderTopWidth: 1 },
  clearBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  clearBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
