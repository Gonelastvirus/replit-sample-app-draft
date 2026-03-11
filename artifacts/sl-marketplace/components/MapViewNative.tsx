import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
};

export default function MapViewNative({ latitude, longitude }: Props) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>Map not supported on web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { width: "100%", height: 180, borderRadius: 12, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  text: { color: "#888", fontSize: 14 },
});
