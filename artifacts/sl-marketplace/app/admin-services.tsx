import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import { useT } from "@/hooks/useT";
import { useApp } from "@/context/AppContext";
import { BASE_URL } from "@/hooks/useApi";
import { SERVICE_TYPES, NEPAL_DISTRICTS } from "@/constants/districts";

type Service = {
  id: number;
  businessName: string;
  serviceType: string;
  phone: string;
  whatsapp?: string | null;
  district: string;
  description?: string | null;
};

const BLANK_FORM = {
  businessName: "",
  serviceType: SERVICE_TYPES[0] || "contractor",
  phone: "",
  whatsapp: "",
  district: "Kathmandu",
  description: "",
};

export default function AdminServicesScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { token, user } = useApp();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ services: Service[] }>({
    queryKey: ["services-admin"],
    queryFn: () => fetch(`${BASE_URL}/services`).then((r) => r.json()),
  });

  const services = data?.services || [];

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const openAdd = () => {
    setEditService(null);
    setForm({ ...BLANK_FORM });
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    setEditService(s);
    setForm({
      businessName: s.businessName,
      serviceType: s.serviceType,
      phone: s.phone,
      whatsapp: s.whatsapp || "",
      district: s.district,
      description: s.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.businessName || !form.phone || !form.district) {
      Alert.alert("Error", "Business name, phone, and district are required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        whatsapp: form.whatsapp || null,
        description: form.description || null,
      };
      const url = editService ? `${BASE_URL}/services/${editService.id}` : `${BASE_URL}/services`;
      const method = editService ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      qc.invalidateQueries({ queryKey: ["services-admin"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      setShowModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (s: Service) => {
    Alert.alert(
      "Delete Service",
      `Delete "${s.businessName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await fetch(`${BASE_URL}/services/${s.id}`, {
              method: "DELETE",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            qc.invalidateQueries({ queryKey: ["services-admin"] });
            qc.invalidateQueries({ queryKey: ["services"] });
          },
        },
      ]
    );
  };

  if (!user || user.role !== "admin") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.error, fontFamily: "Inter_600SemiBold" }}>Admin access required</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 10, borderBottomColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Services</Text>
        <Pressable
          onPress={openAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Count bar */}
      <View style={[styles.countBar, { backgroundColor: colors.backgroundTertiary, borderBottomColor: colors.border }]}>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {services.length} service{services.length !== 1 ? "s" : ""} listed
        </Text>
        <Pressable onPress={() => refetch()} hitSlop={10}>
          <Feather name="refresh-cw" size={15} color={colors.textTertiary} />
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 118 : 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Feather name="tool" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No services yet</Text>
              <Pressable onPress={openAdd} style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Add First Service</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="tool" size={18} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{item.businessName}</Text>
                <Text style={[styles.cardType, { color: colors.primary }]}>{t(item.serviceType)}</Text>
                <View style={styles.cardMeta}>
                  <Feather name="map-pin" size={11} color={colors.textTertiary} />
                  <Text style={[styles.cardMetaText, { color: colors.textTertiary }]}>{item.district}</Text>
                  <Feather name="phone" size={11} color={colors.textTertiary} />
                  <Text style={[styles.cardMetaText, { color: colors.textTertiary }]}>{item.phone}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                onPress={() => openEdit(item)}
                style={[styles.cardBtn, { backgroundColor: colors.backgroundTertiary }]}
                hitSlop={6}
              >
                <Feather name="edit-2" size={14} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item)}
                style={[styles.cardBtn, { backgroundColor: colors.backgroundTertiary }]}
                hitSlop={6}
              >
                <Feather name="trash-2" size={14} color={colors.error} />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modal, { backgroundColor: colors.background }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Modal header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
            <Pressable onPress={() => setShowModal(false)} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editService ? "Edit Service" : "Add New Service"}
            </Text>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            >
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalForm}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Business Name */}
            <MField label="Business Name *" value={form.businessName} onChangeText={(v) => update("businessName", v)} placeholder="e.g. Kathmandu Plumbing Services" colors={colors} />

            {/* Service Type */}
            <View style={styles.mfield}>
              <Text style={[styles.mlabel, { color: colors.textSecondary }]}>Service Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
                {SERVICE_TYPES.map((st) => (
                  <Pressable
                    key={st}
                    onPress={() => update("serviceType", st)}
                    style={[
                      styles.typeChip,
                      {
                        borderColor: form.serviceType === st ? colors.primary : colors.border,
                        backgroundColor: form.serviceType === st ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    <Text style={[styles.typeChipText, { color: form.serviceType === st ? "#fff" : colors.textSecondary }]}>
                      {t(st)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* District */}
            <View style={styles.mfield}>
              <Text style={[styles.mlabel, { color: colors.textSecondary }]}>District *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
                {NEPAL_DISTRICTS.slice(0, 20).map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => update("district", d)}
                    style={[
                      styles.typeChip,
                      {
                        borderColor: form.district === d ? colors.primary : colors.border,
                        backgroundColor: form.district === d ? colors.primary : "transparent",
                      },
                    ]}
                  >
                    <Text style={[styles.typeChipText, { color: form.district === d ? "#fff" : colors.textSecondary }]}>{d}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <MField label="Phone *" value={form.phone} onChangeText={(v) => update("phone", v)} placeholder="+977-9800000000" keyboardType="phone-pad" colors={colors} />
            <MField label="WhatsApp" value={form.whatsapp} onChangeText={(v) => update("whatsapp", v)} placeholder="+977-9800000000" keyboardType="phone-pad" colors={colors} />
            <MField label="Description" value={form.description} onChangeText={(v) => update("description", v)} placeholder="Describe the services offered..." multiline colors={colors} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function MField({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.mfield}>
      <Text style={[styles.mlabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.minput,
          { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
          multiline && styles.mtextarea,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType || "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  countBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  countText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  list: { padding: 14, gap: 10 },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  cardLeft: { flex: 1, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cardIcon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cardType: { fontSize: 12, fontFamily: "Inter_500Medium" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2, flexWrap: "wrap" },
  cardMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardActions: { flexDirection: "column", gap: 6 },
  cardBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 14 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalForm: { padding: 16, gap: 4, paddingBottom: 60 },
  mfield: { marginBottom: 16 },
  mlabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 7 },
  minput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  mtextarea: { minHeight: 80, textAlignVertical: "top", paddingTop: 11 },
  typeChips: { gap: 8, paddingVertical: 2 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, borderWidth: 1 },
  typeChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
