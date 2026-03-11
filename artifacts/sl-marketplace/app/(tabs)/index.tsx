import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/SkeletonLoader";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { useApi } from "@/hooks/useApi";
import { useApp } from "@/context/AppContext";
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

const PROPERTY_TYPES = [
  { key: "house", icon: "home" as const },
  { key: "land", icon: "map" as const },
  { key: "apartment", icon: "layers" as const },
  { key: "commercial", icon: "briefcase" as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const api = useApi();
  const { language, setLanguage } = useApp();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState("");

  const featuredQuery = useQuery<{ properties: Property[] }>({
    queryKey: ["featured"],
    queryFn: () => fetch(`${BASE_URL}/properties/featured`).then((r) => r.json()),
  });

  const recentQuery = useQuery<{ properties: Property[]; total: number }>({
    queryKey: ["recent-properties"],
    queryFn: () => fetch(`${BASE_URL}/properties?limit=10`).then((r) => r.json()),
  });

  React.useEffect(() => {
    AsyncStorage.getItem("@sl_favorites").then((val) => {
      if (val) setFavoriteIds(new Set(JSON.parse(val)));
    });
  }, []);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100 }}
        refreshControl={
          <RefreshControl
            refreshing={!!(featuredQuery.isRefetching || recentQuery.isRefetching)}
            onRefresh={() => { featuredQuery.refetch(); recentQuery.refetch(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <View>
            <Text style={[styles.headerSub, { color: colors.primary }]}>{t("discover")}</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("your_next_home")}</Text>
          </View>
          <Pressable
            onPress={() => setLanguage(language === "en" ? "ne" : "en")}
            style={[styles.langBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.langText, { color: colors.primary }]}>{language === "en" ? "नेपाली" : "English"}</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <Pressable
          onPress={() => router.push("/(tabs)/search")}
          style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="search" size={18} color={colors.textTertiary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>{t("searchPlaceholder")}</Text>
        </Pressable>

        {/* Quick Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {PROPERTY_TYPES.map((pt) => (
            <Pressable
              key={pt.key}
              onPress={() => router.push({ pathname: "/(tabs)/search", params: { propertyType: pt.key } })}
              style={[styles.categoryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={pt.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.categoryText, { color: colors.text }]}>{t(pt.key)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("featured")}</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>{t("viewAll")}</Text>
            </Pressable>
          </View>
          {featuredQuery.isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
              {[1, 2].map((k) => <View key={k} style={{ width: 280 }}><PropertyCardSkeleton /></View>)}
            </ScrollView>
          ) : featuredQuery.data?.properties.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No featured listings yet</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}>
              {(featuredQuery.data?.properties || []).map((p) => (
                <View key={p.id} style={{ width: 280 }}>
                  <PropertyCard
                    property={p}
                    onPress={() => router.push({ pathname: "/property/[id]", params: { id: p.id } })}
                    onFavorite={() => toggleFavorite(p.id)}
                    isFavorited={favoriteIds.has(p.id)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("recent")}</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>{t("viewAll")}</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            {recentQuery.isLoading ? (
              [1, 2, 3].map((k) => <PropertyCardSkeleton key={k} />)
            ) : (
              (recentQuery.data?.properties || []).map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onPress={() => router.push({ pathname: "/property/[id]", params: { id: p.id } })}
                  onFavorite={() => toggleFavorite(p.id)}
                  isFavorited={favoriteIds.has(p.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerSub: { fontSize: 13, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  langBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  langText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchPlaceholder: { fontSize: 15, fontFamily: "Inter_400Regular", flex: 1 },
  categories: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  categoryBtn: { alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 8, width: 80 },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  categoryText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontFamily: "Inter_700Bold" },
  viewAll: { fontSize: 14, fontFamily: "Inter_500Medium" },
  emptyText: { textAlign: "center", padding: 20, fontFamily: "Inter_400Regular" },
});
