import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/SkeletonLoader";
import { FilterSheet, Filters } from "@/components/FilterSheet";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { BASE_URL } from "@/hooks/useApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Property = {
  id: number;
  title: string;
  district: string;
  listingType: "sale" | "rent";
  propertyType: string;
  priceNpr: number;
  areaDhur?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  photos: string[];
  featured?: boolean;
};

export default function SearchScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Filters>({
    district: (params.district as string) || "",
    listingType: (params.listingType as string) || "",
    propertyType: (params.propertyType as string) || "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  useEffect(() => {
    AsyncStorage.getItem("@sl_favorites").then((val) => {
      if (val) setFavoriteIds(new Set(JSON.parse(val)));
    });
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const buildUrl = () => {
    const qs = new URLSearchParams();
    if (filters.district) qs.set("district", filters.district);
    if (filters.listingType) qs.set("listingType", filters.listingType);
    if (filters.propertyType) qs.set("propertyType", filters.propertyType);
    if (filters.minPrice) qs.set("minPrice", filters.minPrice);
    if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice);
    if (filters.bedrooms) qs.set("bedrooms", filters.bedrooms);
    qs.set("limit", "30");
    return `${BASE_URL}/properties?${qs.toString()}`;
  };

  const { data, isLoading, refetch } = useQuery<{ properties: Property[]; total: number }>({
    queryKey: ["properties", filters],
    queryFn: () => fetch(buildUrl()).then((r) => r.json()),
  });

  const filtered = (data?.properties || []).filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.district.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = async (id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem("@sl_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { paddingTop: topPadding + 10, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setShowFilters(true)}
          style={[styles.filterBtn, { backgroundColor: activeFilterCount > 0 ? colors.primary : colors.card, borderColor: activeFilterCount > 0 ? colors.primary : colors.border }]}
        >
          <Feather name="sliders" size={18} color={activeFilterCount > 0 ? "#fff" : colors.text} />
          {activeFilterCount > 0 ? (
            <View style={[styles.filterBadge, { backgroundColor: "#fff" }]}>
              <Text style={[styles.filterBadgeText, { color: colors.primary }]}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Results Count */}
      {!isLoading && (
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </Text>
        </View>
      )}

      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 118 : 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3].map((k) => <PropertyCardSkeleton key={k} />)}
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="search" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("noResults")}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Try adjusting your filters</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => router.push({ pathname: "/property/[id]", params: { id: item.id } })}
            onFavorite={() => toggleFavorite(item.id)}
            isFavorited={favoriteIds.has(item.id)}
          />
        )}
      />

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", gap: 10, borderBottomWidth: 1 },
  searchRow: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, gap: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  filterBtn: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  filterBadge: { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  filterBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  resultsRow: { paddingHorizontal: 20, paddingVertical: 8 },
  resultsText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  list: { padding: 16 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
