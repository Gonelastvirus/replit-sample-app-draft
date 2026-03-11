import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
};

export default function MapViewNative({ latitude, longitude }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      scrollEnabled={false}
      zoomEnabled={false}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: 180, borderRadius: 12 },
});
