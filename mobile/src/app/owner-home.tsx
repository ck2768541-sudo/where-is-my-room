import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import OwnerBottomNav from "../components/OwnerBottomNav";
import { API_BASE_URL } from "../config/api";
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
  isAvailable: boolean;
};

export default function OwnerHomeScreen() {
  const router = useRouter();

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchOwnerProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/properties/owner/my-properties`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to fetch your properties."
        );
        return;
      }

      setProperties(
        Array.isArray(data.properties)
          ? data.properties
          : []
      );
    } catch (error) {
      console.error(
        "Owner home error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOwnerProperties();
    }, [])
  );

  const totalProperties =
    properties.length;

  const availableProperties =
    properties.filter(
      (property) =>
        property.isAvailable
    ).length;

  const occupiedProperties =
    properties.filter(
      (property) =>
        !property.isAvailable
    ).length;

  const recentProperties =
    properties.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.brand}>
              StayRent Owner
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                "/owner-profile" as any
              )
            }
          >
            <Ionicons
              name="person-outline"
              size={21}
              color="#635BFF"
            />
          </TouchableOpacity>
        </View>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroBadge}>
            <Ionicons
              name="sparkles-outline"
              size={14}
              color="#D9D6FE"
            />

            <Text style={styles.heroBadgeText}>
              OWNER DASHBOARD
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Manage rentals{"\n"}
            with confidence.
          </Text>

          <Text style={styles.heroSubtitle}>
            Keep your properties updated,
            available and ready for renters.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.9}
            onPress={() =>
              router.push(
                "/owner-add-property"
              )
            }
          >
            <Ionicons
              name="add"
              size={20}
              color="#635BFF"
            />

            <Text style={styles.heroButtonText}>
              Add Property
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#635BFF"
            />
          </TouchableOpacity>
        </View>

        {/* STATS */}

        <Text style={styles.sectionEyebrow}>
          OVERVIEW
        </Text>

        <Text style={styles.sectionTitle}>
          Your portfolio
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.totalIcon,
              ]}
            >
              <Ionicons
                name="business-outline"
                size={21}
                color="#635BFF"
              />
            </View>

            <Text style={styles.statValue}>
              {totalProperties}
            </Text>

            <Text style={styles.statLabel}>
              Total
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.availableIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#12B76A"
              />
            </View>

            <Text style={styles.statValue}>
              {availableProperties}
            </Text>

            <Text style={styles.statLabel}>
              Available
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.occupiedIcon,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={21}
                color="#F79009"
              />
            </View>

            <Text style={styles.statValue}>
              {occupiedProperties}
            </Text>

            <Text style={styles.statLabel}>
              Occupied
            </Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              QUICK ACTIONS
            </Text>

            <Text style={styles.sectionTitle}>
              Manage faster
            </Text>
          </View>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.88}
            onPress={() =>
              router.push(
                "/owner-add-property"
              )
            }
          >
            <View
              style={[
                styles.quickIcon,
                styles.quickIconPrimary,
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={23}
                color="#635BFF"
              />
            </View>

            <Text style={styles.quickTitle}>
              Add Listing
            </Text>

            <Text style={styles.quickText}>
              Publish a new rental
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.88}
            onPress={() =>
              router.push(
                "/owner-properties"
              )
            }
          >
            <View
              style={[
                styles.quickIcon,
                styles.quickIconGreen,
              ]}
            >
              <Ionicons
                name="home-outline"
                size={23}
                color="#12B76A"
              />
            </View>

            <Text style={styles.quickTitle}>
              My Listings
            </Text>

            <Text style={styles.quickText}>
              Edit and manage
            </Text>
          </TouchableOpacity>
        </View>

        {/* RECENT LISTINGS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              RECENT
            </Text>

            <Text style={styles.sectionTitle}>
              Latest properties
            </Text>
          </View>

          {properties.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                router.push(
                  "/owner-properties"
                )
              }
            >
              <Text style={styles.viewAllText}>
                View all
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="small"
              color="#635BFF"
            />

            <Text style={styles.stateTitle}>
              Loading properties
            </Text>

            <Text style={styles.stateText}>
              Getting your latest listings...
            </Text>
          </View>
        )}

        {!loading &&
          error !== "" && (
            <View style={styles.stateCard}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={27}
                  color="#F04438"
                />
              </View>

              <Text style={styles.stateTitle}>
                Unable to load
              </Text>

              <Text style={styles.stateText}>
                {error}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={
                  fetchOwnerProperties
                }
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {!loading &&
          error === "" &&
          properties.length === 0 && (
            <View style={styles.stateCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="home-outline"
                  size={29}
                  color="#635BFF"
                />
              </View>

              <Text style={styles.stateTitle}>
                No properties yet
              </Text>

              <Text style={styles.stateText}>
                Add your first property to
                start your StayRent portfolio.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={() =>
                  router.push(
                    "/owner-add-property"
                  )
                }
              >
                <Ionicons
                  name="add"
                  size={17}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Add Property
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {!loading &&
          error === "" &&
          recentProperties.map(
            (property) => {
              const imageUrl =
                property.photos &&
                property.photos
                  .length > 0
                  ? property.photos[0]
                  : null;

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
                      style={
                        styles.propertyImage
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={
                        styles.noImage
                      }
                    >
                      <Ionicons
                        name="image-outline"
                        size={28}
                        color="#98A2B3"
                      />
                    </View>
                  )}

                  <View
                    style={
                      styles.propertyBody
                    }
                  >
                    <View
                      style={
                        styles.propertyTopRow
                      }
                    >
                      <View
                        style={
                          styles.propertyInfo
                        }
                      >
                        <Text
                          style={
                            styles.propertyTitle
                          }
                          numberOfLines={1}
                        >
                          {
                            property.title
                          }
                        </Text>

                        <View
                          style={
                            styles.locationRow
                          }
                        >
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#98A2B3"
                          />

                          <Text
                            style={
                              styles.locationText
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {
                              property.locality
                            }
                            ,{" "}
                            {property.city}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.priceWrap
                        }
                      >
                        <Text
                          style={
                            styles.price
                          }
                        >
                          ₹
                          {
                            property.monthlyRent
                          }
                        </Text>

                        <Text
                          style={
                            styles.pricePeriod
                          }
                        >
                          /month
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.propertyBottom
                      }
                    >
                      <View
                        style={
                          styles.propertyTypeBadge
                        }
                      >
                        <Text
                          style={
                            styles.propertyTypeText
                          }
                        >
                          {property.propertyType.toUpperCase()}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          property.isAvailable
                            ? styles.availableBadge
                            : styles.occupiedBadge,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            property.isAvailable
                              ? styles.availableDot
                              : styles.occupiedDot,
                          ]}
                        />

                        <Text
                          style={[
                            styles.statusText,
                            property.isAvailable
                              ? styles.availableText
                              : styles.occupiedText,
                          ]}
                        >
                          {property.isAvailable
                            ? "Available"
                            : "Occupied"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          )}
      </ScrollView>

      <OwnerBottomNav />
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
    width: 270,
    height: 270,
    borderRadius: 135,
    top: -125,
    right: -130,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 90,
    left: -160,
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
    justifyContent: "space-between",
    marginBottom: 22,
  },

  greeting: {
    fontSize: 12,
    fontWeight: "600",
    color: "#98A2B3",
  },

  brand: {
    marginTop: 3,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: "#111827",
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    padding: 22,
    borderRadius: 27,
    backgroundColor: "#111827",
  },

  heroGlow: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -75,
    top: -80,
    backgroundColor: "#312E81",
    opacity: 0.75,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  heroBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.15,
    color: "#E9E7FF",
  },

  heroTitle: {
    marginTop: 18,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.9,
    color: "#FFFFFF",
  },

  heroSubtitle: {
    marginTop: 11,
    maxWidth: 280,
    fontSize: 13,
    lineHeight: 20,
    color: "#C7CDD8",
  },

  heroButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    marginTop: 20,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },

  heroButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#635BFF",
  },

  sectionEyebrow: {
    marginTop: 30,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  sectionTitle: {
    marginTop: 5,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.45,
    color: "#111827",
  },

  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  totalIcon: {
    backgroundColor: "#F1EFFF",
  },

  availableIcon: {
    backgroundColor: "#ECFDF3",
  },

  occupiedIcon: {
    backgroundColor: "#FFFAEB",
  },

  statValue: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "700",
    color: "#98A2B3",
  },

  sectionHeader: {
    marginTop: 4,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  quickGrid: {
    flexDirection: "row",
    gap: 12,
  },

  quickCard: {
    flex: 1,
    minHeight: 135,
    padding: 15,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  quickIconPrimary: {
    backgroundColor: "#F1EFFF",
  },

  quickIconGreen: {
    backgroundColor: "#ECFDF3",
  },

  quickTitle: {
    marginTop: 13,
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  quickText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#98A2B3",
  },

  viewAllText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#635BFF",
  },

  stateCard: {
    padding: 28,
    alignItems: "center",
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  stateTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  stateText: {
    marginTop: 6,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#98A2B3",
  },

  errorIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  retryButton: {
    minHeight: 44,
    marginTop: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    backgroundColor: "#635BFF",
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  propertyCard: {
    marginBottom: 13,
    overflow: "hidden",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  propertyImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#EEF0F6",
  },

  noImage: {
    width: "100%",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F5FF",
  },

  propertyBody: {
    padding: 15,
  },

  propertyTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  propertyInfo: {
    flex: 1,
    paddingRight: 10,
  },

  propertyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  locationRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 10,
    color: "#667085",
  },

  priceWrap: {
    alignItems: "flex-end",
  },

  price: {
    fontSize: 17,
    fontWeight: "900",
    color: "#635BFF",
  },

  pricePeriod: {
    marginTop: 1,
    fontSize: 8,
    color: "#98A2B3",
  },

  propertyBottom: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  propertyTypeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#F1EFFF",
  },

  propertyTypeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#635BFF",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  availableBadge: {
    backgroundColor: "#ECFDF3",
  },

  occupiedBadge: {
    backgroundColor: "#FFF4ED",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  availableDot: {
    backgroundColor: "#12B76A",
  },

  occupiedDot: {
    backgroundColor: "#F79009",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  availableText: {
    color: "#027A48",
  },

  occupiedText: {
    color: "#B54708",
  },
});