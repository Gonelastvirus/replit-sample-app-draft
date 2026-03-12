import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { useApp } from "@/context/AppContext";
import { BASE_URL } from "@/hooks/useApi";

export default function AuthScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { setAuth } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin ? { email, password } : { name, email, password, phone: phone || undefined };
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      setAuth(data.user, data.token);
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Close button */}
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>

        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
            <Feather name="home" size={28} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>SL Housing & Construction</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {isLogin ? t("loginTitle") : t("registerTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isLogin ? t("loginSubtitle") : t("registerSubtitle")}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin ? (
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("name")}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Your full name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          ) : null}

          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t("email")}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="email@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t("password")}</Text>
            <View style={[styles.passwordRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          {!isLogin ? (
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t("phone")} (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="+977-98XXXXXXXX"
                placeholderTextColor={colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          <Text style={styles.submitBtnText}>
            {loading ? t("submitting") : isLogin ? t("login") : t("register")}
          </Text>
        </Pressable>

        <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>
            {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}
          </Text>
          <Text style={[styles.switchLink, { color: colors.primary }]}>
            {isLogin ? t("register") : t("login")}
          </Text>
        </Pressable>

        <View style={[styles.divider, { borderTopColor: colors.border }]}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.guestText, { color: colors.textTertiary }]}>{t("continueAsGuest")}</Text>
          </Pressable>
        </View>

        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  closeBtn: { alignSelf: "flex-end", marginBottom: 8 },
  brand: { alignItems: "center", gap: 10, marginBottom: 24 },
  brandIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 28 },
  form: { gap: 16, marginBottom: 24 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 7, letterSpacing: 0.3 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular" },
  passwordRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  passwordInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  submitBtn: { paddingVertical: 16, borderRadius: 14, alignItems: "center", marginBottom: 16 },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  switchLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  divider: { borderTopWidth: 1, marginTop: 20, paddingTop: 16, alignItems: "center" },
  guestText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  
});
