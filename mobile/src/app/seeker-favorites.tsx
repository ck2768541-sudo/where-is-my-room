import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { getAuthToken } from "../utils/authStorage";

type Property = {
  _id: string;
  title: string;
  propertyType: "room" | "pg" | "flat";
  monthlyRent: number;
  availableFor: "anyone" | "male" | "female" | "family";
  locality: string;
  city: string;
  photos?: string[];
};

export default function SeekerFavoritesScreen() {
  const router = useRouter();

  const [favorites, setFavorites] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    removingPropertyId,
    setRemovingPropertyId,
  ] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        await getAuthToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/favorites`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to fetch favorites."
        );
        return;
      }

      setFavorites(
        Array.isArray(data.favorites)
          ? data.favorites
          : []
      );
    } catch (error) {
      console.error(
        "Fetch favorites error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (
    propertyId: string
  ) => {
    try {
      setRemovingPropertyId(propertyId);

      const token =
        await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/favorites/${propertyId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          "Remove failed",
          data?.message ||
            "Unable to remove property from favorites."
        );
        return;
      }

      setFavorites(
        (currentFavorites) =>
          currentFavorites.filter(
            (property) =>
              property._id !== propertyId
          )
      );
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    } finally {
      setRemovingPropertyId(null);
    }
  };

  const confirmRemoveFavorite = (
    propertyId: string,
    propertyTitle: string
  ) => {
    Alert.alert(
      "Remove Favorite",
      `Remove "${propertyTitle}" from your favorites?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removeFavorite(propertyId),
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>
              Favorites
            </Text>

            <Text style={styles.subtitle}>
              Your saved properties
            </Text>
          </View>
        </View>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Loading favorites...
            </Text>
          </View>
        )}

        {!loading && error !== "" && (
          <View style={styles.centerBox}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color={COLORS.error}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchFavorites}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading &&
          error === "" &&
          favorites.length === 0 && (
            <View style={styles.centerBox}>
              <Ionicons
                name="heart-outline"
                size={46}
                color={COLORS.textSecondary}
              />

              <Text style={styles.emptyTitle}>
                No favorites yet
              </Text>

              <Text style={styles.emptyText}>
                Tap the heart icon on a property to save it here.
              </Text>
            </View>
          )}

        {!loading &&
          error === "" &&
          favorites.map((property) => {
            const imageUrl =
              property.photos &&
              property.photos.length > 0
                ? property.photos[0]
                : null;

            const isRemoving =
              removingPropertyId ===
              property._id;

            return (
              <TouchableOpacity
                key={property._id}
                style={styles.propertyCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname:
                      "/property-details",
                    params: {
                      propertyId:
                        property._id,
                    },
                  })
                }
              >
                {imageUrl ? (
                  <Image
                    source={{
                      uri: imageUrl,
                    }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImage}>
                    <Ionicons
                      name="image-outline"
                      size={38}
                      color={COLORS.textSecondary}
                    />
                  </View>
                )}

                <View style={styles.propertyContent}>
                  <View style={styles.topRow}>
                    <Text
                      style={styles.propertyTitle}
                      numberOfLines={2}
                    >
                      {property.title}
                    </Text>

                    <TouchableOpacity
                      style={styles.removeFavoriteButton}
                      activeOpacity={0.75}
                      disabled={isRemoving}
                      onPress={(event) => {
                        event.stopPropagation();

                        confirmRemoveFavorite(
                          property._id,
                          property.title
                        );
                      }}
                    >
                      {isRemoving ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.error}
                        />
                      ) : (
                        <Ionicons
                          name="heart"
                          size={24}
                          color={COLORS.error}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.rent}>
                    ₹{property.monthlyRent} / month
                  </Text>

                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.locationText}>
                      {property.locality}, {property.city}
                    </Text>
                  </View>

                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {property.propertyType.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        For {property.availableFor}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  centerBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },

  errorText: {
    marginTop: 10,
    textAlign: "center",
    color: COLORS.error,
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },

  retryText: {
    fontWeight: "700",
    color: COLORS.surface,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: COLORS.textSecondary,
  },

  propertyCard: {
    marginBottom: 18,
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  propertyImage: {
    width: "100%",
    height: 185,
  },

  noImage: {
    height: 185,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  propertyContent: {
    padding: 16,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  propertyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  removeFavoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
  },

  rent: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },

  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
  },
});