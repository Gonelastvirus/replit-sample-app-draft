import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { useApp } from "@/context/AppContext";
import { useApi } from "@/hooks/useApi";
import { BASE_URL } from "@/hooks/useApi";
import { formatPrice } from "@/utils/format";

type Property = {
  id: number;
  title: string;
  district: string;
  listingType: string;
  propertyType: string;
  priceNpr: number;
  status: string;
  featured: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string | null;
  photos: string[];
  createdAt: string;
};

const STATUS_FILTER = ["pending", "approved", "rejected"];

export default function AdminTabScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { user, token } = useApp();
  const api = useApi();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const { data, isLoading, refetch } = useQuery<{ properties: Property[]; total: number }>({
    queryKey: ["admin-properties", selectedStatus],
    queryFn: () => fetch(`${BASE_URL}/admin/properties?status=${selectedStatus}&limit=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json()),
    enabled: !!user?.role && user.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/properties/${id}/approve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.post(`/admin/properties/${id}/reject`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      api.post(`/admin/properties/${id}/feature`, { featured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/properties/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  if (!user || user.role !== "admin") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <View style={styles.unauthorized}>
          <Feather name="shield-off" size={48} color={colors.error} />
          <Text style={[styles.unauthTitle, { color: colors.text }]}>Admin Access Only</Text>
          <Text style={[styles.unauthDesc, { color: colors.textSecondary }]}>
            This section requires admin privileges
          </Text>
          <Pressable onPress={() => router.push("/auth")} style={[styles.authBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.authBtnText}>{t("login")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleReject = (id: number) => {
    Alert.prompt
      ? Alert.prompt("Reject Listing", "Enter rejection reason:", (reason) => {
          rejectMutation.mutate({ id, reason: reason || "Rejected by admin" });
        })
      : Alert.alert("Reject", "Reject this listing?", [
          { text: "Cancel", style: "cancel" },
          { text: "Reject", style: "destructive", onPress: () => rejectMutation.mutate({ id, reason: "Rejected by admin" }) },
        ]);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Permanently delete this listing?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const properties = data?.properties || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t("adminPanel")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {data?.total || 0} {selectedStatus} listings
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/admin-services")}
            style={[styles.headerBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
          >
            <Feather name="tool" size={13} color={colors.primary} />
            <Text style={[styles.headerBtnText, { color: colors.primary }]}>Services</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/admin-about")}
            style={[styles.headerBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
          >
            <Feather name="info" size={13} color={colors.primary} />
            <Text style={[styles.headerBtnText, { color: colors.primary }]}>About</Text>
          </Pressable>
        </View>
      </View>

      {/* Status Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        {STATUS_FILTER.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSelectedStatus(s)}
            style={[styles.tab, selectedStatus === s && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          >
            <Text style={[styles.tabText, { color: selectedStatus === s ? colors.primary : colors.textSecondary }]}>
              {t(s)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 118 : 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={properties.length > 0}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Feather name="inbox" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {selectedStatus} listings</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {item.photos[0] ? (
              <Image source={{ uri: item.photos[0] }} style={styles.cardImage} />
            ) : null}
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>
                  {item.district} · {formatPrice(item.priceNpr)}
                </Text>
              </View>
              <View style={styles.ownerRow}>
                <Feather name="user" size={12} color={colors.textTertiary} />
                <Text style={[styles.ownerText, { color: colors.textTertiary }]}>{item.ownerName} · {item.ownerPhone}</Text>
              </View>
              <View style={styles.actions}>
                {selectedStatus === "pending" ? (
                  <>
                    <Pressable
                      onPress={() => approveMutation.mutate(item.id)}
                      style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    >
                      <Feather name="check" size={14} color="#fff" />
                      <Text style={styles.actionBtnText}>{t("approve")}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleReject(item.id)}
                      style={[styles.actionBtn, { backgroundColor: colors.error }]}
                    >
                      <Feather name="x" size={14} color="#fff" />
                      <Text style={styles.actionBtnText}>{t("reject")}</Text>
                    </Pressable>
                  </>
                ) : null}
                {selectedStatus === "approved" ? (
                  <Pressable
                    onPress={() => featureMutation.mutate({ id: item.id, featured: !item.featured })}
                    style={[styles.actionBtn, { backgroundColor: item.featured ? "#F5A623" : colors.backgroundTertiary }]}
                  >
                    <Feather name="star" size={14} color={item.featured ? "#fff" : colors.textSecondary} />
                    <Text style={[styles.actionBtnText, { color: item.featured ? "#fff" : colors.textSecondary }]}>
                      {item.featured ? t("unfeature") : t("feature")}
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <Feather name="trash-2" size={14} color={colors.error} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerActions: { flexDirection: "row", gap: 8, marginBottom: 2 },
  headerBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, borderWidth: 1 },
  headerBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: {},
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  cardImage: { width: "100%", height: 140 },
  cardBody: { padding: 14, gap: 6 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardMeta: { flexDirection: "row" },
  cardMetaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ownerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  actionBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  unauthorized: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  unauthTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  unauthDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  authBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  authBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
