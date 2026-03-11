import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceCardSkeleton } from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { BASE_URL } from "@/hooks/useApi";
import { SERVICE_TYPES } from "@/constants/districts";

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
  architecture: "pen-tool",
  construction: "tool",
  interior: "layers",
  plumbing: "droplet",
  electrical: "zap",
  painting: "edit-3",
  roofing: "home",
  landscaping: "sun",
};

export default function ServicesScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [selectedType, setSelectedType] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery<{ services: Service[] }>({
    queryKey: ["services", selectedType],
    queryFn: () => {
      const url = selectedType
        ? `${BASE_URL}/services?serviceType=${selectedType}`
        : `${BASE_URL}/services`;
      return fetch(url).then((r) => r.json());
    },
  });

  const services = data?.services || [];
  const allTypes = ["", ...SERVICE_TYPES];

  const FilterChips = (
    <View style={[styles.filterWrap, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {allTypes.map((item) => {
          const active = selectedType === item;
          const icon = item ? SERVICE_ICONS[item] : "grid";
          return (
            <Pressable
              key={item}
              onPress={() => setSelectedType(item)}
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : colors.card,
                },
              ]}
            >
              <Feather
                name={icon || "tool"}
                size={13}
                color={active ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#fff" : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {item === "" ? t("all") : t(item)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 10,
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t("servicesTitle")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("servicesSubtitle")}
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {services.length}
          </Text>
        </View>
      </View>

      {/* Filter chips row */}
      {FilterChips}

      {/* Services list */}
      <FlatList
        data={isLoading ? [] : services}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 118 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View>{[1, 2, 3, 4, 5].map((k) => <ServiceCardSkeleton key={k} />)}</View>
          ) : (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <Feather name="tool" size={32} color={colors.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("noResults")}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Try a different service category
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <ServiceCard service={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  countText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  filterWrap: {
    borderBottomWidth: 1,
  },
  chipRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  list: { padding: 16 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
