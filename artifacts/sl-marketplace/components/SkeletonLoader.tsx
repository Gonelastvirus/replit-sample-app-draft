import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function SkeletonBlock({ width, height, style }: { width?: number | string; height: number; style?: object }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width: width as number, height, borderRadius: 8, backgroundColor: colors.border, opacity }, style]}
    />
  );
}

export function PropertyCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <SkeletonBlock width="100%" height={200} style={{ borderRadius: 0 }} />
      <View style={styles.content}>
        <SkeletonBlock width={120} height={18} />
        <SkeletonBlock width="80%" height={16} style={{ marginTop: 8 }} />
        <SkeletonBlock width="40%" height={14} style={{ marginTop: 6 }} />
        <View style={styles.row}>
          <SkeletonBlock width={60} height={12} />
          <SkeletonBlock width={60} height={12} />
          <SkeletonBlock width={60} height={12} />
        </View>
      </View>
    </View>
  );
}

export function ServiceCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.serviceCard, { backgroundColor: colors.card }]}>
      <SkeletonBlock width={44} height={44} style={{ borderRadius: 12 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBlock width="60%" height={15} />
        <SkeletonBlock width="40%" height={12} />
        <SkeletonBlock width="70%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  content: { padding: 14, gap: 4 },
  row: { flexDirection: "row", gap: 16, marginTop: 8 },
  serviceCard: { flexDirection: "row", borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
});
