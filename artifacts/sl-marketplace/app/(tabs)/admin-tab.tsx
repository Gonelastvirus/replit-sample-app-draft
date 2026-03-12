import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
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
import { formatPrice, getTimeAgo } from "@/utils/format";

type Property = {
  id: number;
  title: string;
  description: string;
  district: string;
  listingType: string;
  propertyType: string;
  priceNpr: number;
  areaDhur?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  buildYear?: number | null;
  amenities: string[];
  status: string;
  featured: boolean;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string | null;
  rejectionReason?: string | null;
  photos: string[];
  createdAt: string;
};

const STATUS_FILTER = ["pending", "approved", "rejected"];

export default function AdminTabScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { user, token, pendingCount, refreshPending } = useApp();
  const api = useApi();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery<{ properties: Property[]; total: number }>({
    queryKey: ["admin-properties", selectedStatus],
    queryFn: () => fetch(`${BASE_URL}/admin/properties?status=${selectedStatus}&limit=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json()),
    enabled: !!user?.role && user.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/properties/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      refreshPending();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.post(`/admin/properties/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      refreshPending();
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      api.post(`/admin/properties/${id}/feature`, { featured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/properties/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      refreshPending();
    },
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
      {/* Header */}
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

      {/* Notification Banner */}
      {pendingCount > 0 && selectedStatus !== "pending" ? (
        <Pressable
          onPress={() => setSelectedStatus("pending")}
          style={[styles.notifBanner, { backgroundColor: colors.primary }]}
        >
          <View style={styles.notifIcon}>
            <Feather name="bell" size={14} color="#fff" />
            <View style={[styles.notifDot, { backgroundColor: "#FFD700" }]} />
          </View>
          <Text style={styles.notifText}>
            {pendingCount} new listing{pendingCount !== 1 ? "s" : ""} pending review
          </Text>
          <Feather name="chevron-right" size={16} color="#fff" />
        </Pressable>
      ) : null}

      {/* Pending count reminder in pending tab */}
      {selectedStatus === "pending" && pendingCount > 0 ? (
        <View style={[styles.pendingBar, { backgroundColor: colors.primary + "12", borderBottomColor: colors.primary + "30" }]}>
          <Feather name="clock" size={13} color={colors.primary} />
          <Text style={[styles.pendingBarText, { color: colors.primary }]}>
            {pendingCount} listing{pendingCount !== 1 ? "s" : ""} awaiting your review
          </Text>
        </View>
      ) : null}

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
            {s === "pending" && pendingCount > 0 ? (
              <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tabBadgeText}>{pendingCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      {/* Listings */}
      <FlatList
        data={properties}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 118 : 100 }]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => { refetch(); refreshPending(); }}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Feather name="inbox" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {selectedStatus} listings</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: isExpanded ? colors.primary : colors.border }]}>
              {/* Thumbnail + summary row */}
              <Pressable
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                style={styles.cardTop}
              >
                {item.photos[0] ? (
                  <Image source={{ uri: item.photos[0] }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
                    <Feather name="home" size={22} color={colors.textTertiary} />
                  </View>
                )}
                <View style={styles.cardSummary}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textTertiary} />
                  </View>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                    {item.district} · {formatPrice(item.priceNpr)}
                  </Text>
                  <View style={styles.ownerRow}>
                    <Feather name="user" size={11} color={colors.textTertiary} />
                    <Text style={[styles.ownerText, { color: colors.textTertiary }]}>{item.ownerName}</Text>
                    <Text style={[styles.dot, { color: colors.textTertiary }]}>·</Text>
                    <Feather name="clock" size={11} color={colors.textTertiary} />
                    <Text style={[styles.ownerText, { color: colors.textTertiary }]}>{getTimeAgo(item.createdAt)}</Text>
                  </View>
                </View>
              </Pressable>

              {/* Expanded detail view */}
              {isExpanded ? (
                <View style={[styles.detail, { borderTopColor: colors.border }]}>
                  {/* Photo gallery if multiple photos */}
                  {item.photos.length > 1 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                      {item.photos.map((p, i) => (
                        <Image key={i} source={{ uri: p }} style={styles.photoItem} />
                      ))}
                    </ScrollView>
                  ) : null}

                  {/* Specs row */}
                  <View style={styles.specsRow}>
                    <SpecBadge icon="layers" label={t(item.propertyType)} colors={colors} />
                    <SpecBadge icon={item.listingType === "rent" ? "key" : "tag"} label={t("for" + item.listingType.charAt(0).toUpperCase() + item.listingType.slice(1))} colors={colors} />
                    {item.areaDhur ? <SpecBadge icon="maximize-2" label={`${item.areaDhur} Dhur`} colors={colors} /> : null}
                    {item.bedrooms ? <SpecBadge icon="moon" label={`${item.bedrooms} Bed`} colors={colors} /> : null}
                    {item.bathrooms ? <SpecBadge icon="droplet" label={`${item.bathrooms} Bath`} colors={colors} /> : null}
                    {item.buildYear ? <SpecBadge icon="calendar" label={String(item.buildYear)} colors={colors} /> : null}
                  </View>

                  {/* Description */}
                  <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={4}>
                    {item.description}
                  </Text>

                  {/* Owner contact */}
                  <View style={[styles.contactBox, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Feather name="user" size={14} color={colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{item.ownerName}</Text>
                      <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{item.ownerPhone}</Text>
                      {item.ownerWhatsapp ? (
                        <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>WA: {item.ownerWhatsapp}</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Rejection reason if rejected */}
                  {item.rejectionReason ? (
                    <View style={[styles.rejectBox, { backgroundColor: colors.error + "12", borderColor: colors.error + "30" }]}>
                      <Feather name="alert-circle" size={13} color={colors.error} />
                      <Text style={[styles.rejectText, { color: colors.error }]}>{item.rejectionReason}</Text>
                    </View>
                  ) : null}

                  {/* Full detail button */}
                  <Pressable
                    onPress={() => router.push({ pathname: "/property/[id]", params: { id: item.id } })}
                    style={[styles.fullDetailBtn, { borderColor: colors.border }]}
                  >
                    <Feather name="external-link" size={14} color={colors.textSecondary} />
                    <Text style={[styles.fullDetailText, { color: colors.textSecondary }]}>View Full Listing Page</Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Actions */}
              <View style={[styles.actions, { borderTopColor: colors.border }]}>
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
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <Feather name="trash-2" size={14} color={colors.error} />
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function SpecBadge({ icon, label, colors }: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={[styles.spec, { backgroundColor: colors.backgroundTertiary }]}>
      <Feather name={icon} size={11} color={colors.textSecondary} />
      <Text style={[styles.specText, { color: colors.textSecondary }]}>{label}</Text>
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
  notifBanner: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  notifIcon: { position: "relative" },
  notifDot: { position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: 3.5 },
  notifText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#fff" },
  pendingBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  pendingBarText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 5, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: {},
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, minWidth: 18, alignItems: "center" },
  tabBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  list: { padding: 14, gap: 12 },
  card: { borderRadius: 14, overflow: "hidden", borderWidth: 1.5 },
  cardTop: { flexDirection: "row", gap: 12, padding: 12 },
  thumb: { width: 70, height: 70, borderRadius: 10 },
  thumbPlaceholder: { alignItems: "center", justifyContent: "center" },
  cardSummary: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  cardMeta: { fontSize: 13, fontFamily: "Inter_400Regular" },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  ownerText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dot: { fontSize: 11 },
  detail: { borderTopWidth: 1, padding: 12, gap: 10 },
  photoScroll: { marginBottom: 2 },
  photoItem: { width: 120, height: 80, borderRadius: 8, marginRight: 8 },
  specsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  spec: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  specText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  desc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  contactBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 10, borderRadius: 10, borderWidth: 1 },
  contactName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  contactPhone: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  rejectBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 10, borderRadius: 8, borderWidth: 1 },
  rejectText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  fullDetailBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 9, borderRadius: 8, borderWidth: 1 },
  fullDetailText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  actions: { flexDirection: "row", gap: 8, padding: 12, paddingTop: 10, borderTopWidth: 1, flexWrap: "wrap", alignItems: "center" },
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
