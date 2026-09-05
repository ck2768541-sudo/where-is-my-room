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
import { getAuthToken } from "../utils/authStorage";
import SeekerBottomNav from "../components/SeekerBottomNav";

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
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
         onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/seeker-home");
  }
}}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrow}>
              YOUR COLLECTION
            </Text>

            <Text style={styles.title}>
              Saved properties
            </Text>

            <Text style={styles.subtitle}>
              Keep your favorite rentals in one place.
            </Text>
          </View>

          <View style={styles.headerHeart}>
            <Ionicons
              name="heart"
              size={21}
              color="#F04438"
            />
          </View>
        </View>

        {!loading && error === "" && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="bookmark-outline"
                size={21}
                color="#635BFF"
              />
            </View>

            <View style={styles.summaryTextWrap}>
              <Text style={styles.summaryLabel}>
                SAVED
              </Text>

              <Text style={styles.summaryTitle}>
                {favorites.length}{" "}
                {favorites.length === 1
                  ? "property"
                  : "properties"}
              </Text>
            </View>

            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>
                {favorites.length}
              </Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.centerBox}>
            <View style={styles.loadingIconBox}>
              <ActivityIndicator
                size="small"
                color="#635BFF"
              />
            </View>

            <Text style={styles.loadingTitle}>
              Loading your favorites
            </Text>

            <Text style={styles.loadingText}>
              Getting your saved rentals...
            </Text>
          </View>
        )}

        {!loading && error !== "" && (
          <View style={styles.centerBox}>
            <View style={styles.errorIconBox}>
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color="#F04438"
              />
            </View>

            <Text style={styles.errorTitle}>
              Unable to load favorites
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchFavorites}
              activeOpacity={0.9}
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#FFFFFF"
              />

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
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="heart-outline"
                  size={31}
                  color="#635BFF"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No favorites yet
              </Text>

              <Text style={styles.emptyText}>
                Tap the heart icon on any property
                to save it here for later.
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
                activeOpacity={0.92}
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
                <View style={styles.imageWrap}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.propertyImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImage}>
                      <View
                        style={
                          styles.noImageIconBox
                        }
                      >
                        <Ionicons
                          name="image-outline"
                          size={30}
                          color="#635BFF"
                        />
                      </View>

                      <Text
                        style={styles.noImageText}
                      >
                        Photo not available
                      </Text>
                    </View>
                  )}

                  <View
                    style={styles.typeImageBadge}
                  >
                    <Text
                      style={
                        styles.typeImageBadgeText
                      }
                    >
                      {property.propertyType.toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.removeFavoriteButton
                    }
                    activeOpacity={0.8}
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
                        color="#F04438"
                      />
                    ) : (
                      <Ionicons
                        name="heart"
                        size={22}
                        color="#F04438"
                      />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.propertyContent}>
                  <View style={styles.topRow}>
                    <View style={styles.titleWrap}>
                      <Text
                        style={styles.propertyTitle}
                        numberOfLines={2}
                      >
                        {property.title}
                      </Text>

                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location-outline"
                          size={15}
                          color="#98A2B3"
                        />

                        <Text
                          style={styles.locationText}
                          numberOfLines={1}
                        >
                          {property.locality},{" "}
                          {property.city}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rentWrap}>
                      <Text style={styles.rent}>
                        ₹{property.monthlyRent}
                      </Text>

                      <Text style={styles.rentPeriod}>
                        /month
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.bottomRow}>
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Ionicons
                          name="person-outline"
                          size={13}
                          color="#635BFF"
                        />

                        <Text style={styles.badgeText}>
                          For {property.availableFor}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>
                        View
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#635BFF"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      <SeekerBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },

  glowOne: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -125,
    right: -120,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    bottom: 30,
    left: -145,
    backgroundColor: "#F5F3FF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 125,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  headerTextWrap: {
    flex: 1,
    marginLeft: 13,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  title: {
    marginTop: 3,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#98A2B3",
  },

  headerHeart: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#FEE4E2",
  },

  summaryCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  summaryTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#635BFF",
  },

  summaryTitle: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  summaryBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  summaryBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#635BFF",
  },

  centerBox: {
    marginTop: 12,
    padding: 30,
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },

  loadingIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  loadingText: {
    marginTop: 6,
    fontSize: 11,
    color: "#98A2B3",
  },

  errorIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  errorText: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#667085",
  },

  retryButton: {
    height: 48,
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 15,
    backgroundColor: "#635BFF",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  emptyText: {
    marginTop: 7,
    maxWidth: 260,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    color: "#98A2B3",
  },

  propertyCard: {
    marginBottom: 18,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  imageWrap: {
    position: "relative",
  },

  propertyImage: {
    width: "100%",
    height: 205,
    backgroundColor: "#EEF0F6",
  },

  noImage: {
    height: 205,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F5FF",
  },

  noImageIconBox: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  noImageText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "600",
    color: "#98A2B3",
  },

  typeImageBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(17,24,39,0.84)",
  },

  typeImageBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#FFFFFF",
  },

  removeFavoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 5,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  propertyContent: {
    padding: 17,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  titleWrap: {
    flex: 1,
    paddingRight: 12,
  },

  propertyTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: "#111827",
  },

  rentWrap: {
    alignItems: "flex-end",
  },

  rent: {
    fontSize: 19,
    fontWeight: "900",
    color: "#635BFF",
  },

  rentPeriod: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: "600",
    color: "#98A2B3",
  },

  locationRow: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 11,
    color: "#667085",
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F0F1F4",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  badgeRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  badge: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F1EFFF",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#635BFF",
    textTransform: "capitalize",
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F8F7FF",
  },

  viewButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#635BFF",
  },
});
