import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatPrice } from "@/utils/format";

const { width } = Dimensions.get("window");

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

type Props = {
  property: Property;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  horizontal?: boolean;
};

export function PropertyCard({ property, onPress, onFavorite, isFavorited, horizontal }: Props) {
  const colors = useColors();
  const isRent = property.listingType === "rent";
  const photo = property.photos[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";

  if (horizontal) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.hCard, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
      >
        <Image source={{ uri: photo }} style={styles.hImage} />
        <View style={styles.hContent}>
          <View style={[styles.badge, { backgroundColor: isRent ? colors.primary : colors.success }]}>
            <Text style={styles.badgeText}>{isRent ? "RENT" : "SALE"}</Text>
          </View>
          <Text style={[styles.hTitle, { color: colors.text }]} numberOfLines={2}>{property.title}</Text>
          <View style={styles.row}>
            <Feather name="map-pin" size={12} color={colors.textSecondary} />
            <Text style={[styles.hDistrict, { color: colors.textSecondary }]}>{property.district}</Text>
          </View>
          <Text style={[styles.hPrice, { color: colors.primary }]}>
            {formatPrice(property.priceNpr, isRent)}
          </Text>
          {(property.bedrooms || property.areaDhur) ? (
            <View style={styles.specs}>
              {property.bedrooms ? (
                <View style={styles.spec}>
                  <Feather name="home" size={11} color={colors.textTertiary} />
                  <Text style={[styles.specText, { color: colors.textTertiary }]}>{property.bedrooms} bd</Text>
                </View>
              ) : null}
              {property.areaDhur ? (
                <View style={styles.spec}>
                  <Feather name="maximize-2" size={11} color={colors.textTertiary} />
                  <Text style={[styles.specText, { color: colors.textTertiary }]}>{property.areaDhur} Dhur</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
        {onFavorite ? (
          <Pressable onPress={onFavorite} style={styles.hFav} hitSlop={12}>
            <Feather name="heart" size={18} color={isFavorited ? colors.primary : colors.textTertiary} />
          </Pressable>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: photo }} style={styles.image} />
        <View style={[styles.badge, { backgroundColor: isRent ? colors.primary : colors.success, position: "absolute", top: 10, left: 10 }]}>
          <Text style={styles.badgeText}>{isRent ? "RENT" : "SALE"}</Text>
        </View>
        {property.featured ? (
          <View style={[styles.featuredBadge, { backgroundColor: "#F5A623" }]}>
            <Feather name="star" size={10} color="#fff" />
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        ) : null}
        {onFavorite ? (
          <Pressable
            onPress={onFavorite}
            style={[styles.favButton, { backgroundColor: "rgba(0,0,0,0.4)" }]}
            hitSlop={10}
          >
            <Feather
              name={isFavorited ? "heart" : "heart"}
              size={16}
              color={isFavorited ? "#FF4B4B" : "#fff"}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.content}>
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatPrice(property.priceNpr, isRent)}
        </Text>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.row}>
          <Feather name="map-pin" size={12} color={colors.textSecondary} />
          <Text style={[styles.location, { color: colors.textSecondary }]}>{property.district}</Text>
        </View>
        {(property.bedrooms || property.bathrooms || property.areaDhur) ? (
          <View style={[styles.specs, { borderTopColor: colors.border }]}>
            {property.bedrooms ? (
              <View style={styles.spec}>
                <Feather name="home" size={12} color={colors.textTertiary} />
                <Text style={[styles.specText, { color: colors.textTertiary }]}>{property.bedrooms} Beds</Text>
              </View>
            ) : null}
            {property.bathrooms ? (
              <View style={styles.spec}>
                <Feather name="droplet" size={12} color={colors.textTertiary} />
                <Text style={[styles.specText, { color: colors.textTertiary }]}>{property.bathrooms} Bath</Text>
              </View>
            ) : null}
            {property.areaDhur ? (
              <View style={styles.spec}>
                <Feather name="maximize-2" size={12} color={colors.textTertiary} />
                <Text style={[styles.specText, { color: colors.textTertiary }]}>{property.areaDhur} Dhur</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 200 },
  content: { padding: 14 },
  price: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 13, fontFamily: "Inter_400Regular" },
  specs: { flexDirection: "row", gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  spec: { flexDirection: "row", alignItems: "center", gap: 4 },
  specText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  featuredBadge: { position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  featuredText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  favButton: { position: "absolute", bottom: 10, right: 10, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  // Horizontal card
  hCard: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  hImage: { width: 110, height: 110 },
  hContent: { flex: 1, padding: 12, gap: 3 },
  hTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  hDistrict: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 2 },
  hPrice: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 2 },
  hFav: { padding: 12, alignSelf: "flex-start" },
});
