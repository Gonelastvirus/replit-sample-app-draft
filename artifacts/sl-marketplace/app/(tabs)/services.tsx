import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
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

export default function ServicesScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [selectedType, setSelectedType] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery<{ services: Service[] }>({
    queryKey: ["services", selectedType],
    queryFn: () => {
      const url = selectedType ? `${BASE_URL}/services?serviceType=${selectedType}` : `${BASE_URL}/services`;
      return fetch(url).then((r) => r.json());
    },
  });

  const services = data?.services || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("servicesTitle")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("servicesSubtitle")}</Text>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={["", ...SERVICE_TYPES]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedType(item)}
            style={[styles.chip, { borderColor: selectedType === item ? colors.primary : colors.border, backgroundColor: selectedType === item ? colors.primary + "15" : "transparent" }]}
          >
            <Text style={[styles.chipText, { color: selectedType === item ? colors.primary : colors.textSecondary }]}>
              {item === "" ? t("all") : t(item)}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={isLoading ? [] : services}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 118 : 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={services.length > 0}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View>{[1, 2, 3, 4, 5].map((k) => <ServiceCardSkeleton key={k} />)}</View>
          ) : (
            <View style={styles.empty}>
              <Feather name="tool" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("noResults")}</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 3 },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { padding: 16 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
});
