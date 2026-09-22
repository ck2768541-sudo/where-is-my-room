import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";


import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { clearAuthSession, getAuthToken } from "../utils/authStorage";
import OwnerBottomNav from "../components/OwnerBottomNav";

type Property = {
  _id: string;
  title: string;
  propertyType: "room" | "pg" | "flat" | "hotel";
  monthlyRent: number;
  acAvailable?: boolean;
  acPricePerDay?: number | null;
  nonAcAvailable?: boolean;
  nonAcPricePerDay?: number | null;
  availableFor: "anyone" | "male" | "female" | "family";
  locality: string;
  city: string;
  photos?: string[];
  isAvailable: boolean;
  isVerified?: boolean;
  moderationStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
};

export default function OwnerPropertiesScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 380 || height < 700;
  const horizontalPadding =
    width < 360 ? 14 : width < 430 ? 18 : 20;
  const contentMaxWidth = 720;

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  

  const [updatingPropertyId, setUpdatingPropertyId] =
    useState<string | null>(null);

  const [deletingPropertyId, setDeletingPropertyId] =
    useState<string | null>(null);

  const fetchOwnerProperties = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

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
        "Owner properties error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchOwnerProperties(false);
    } finally {
      setRefreshing(false);
    }
  };

  const updateAvailability = async (
    propertyId: string,
    currentStatus: boolean
  ) => {
    try {
      setUpdatingPropertyId(propertyId);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );
        return;
      }

      const newStatus = !currentStatus;

      const response = await fetch(
        `${API_BASE_URL}/properties/${propertyId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isAvailable: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Update failed",
          data?.message ||
            "Unable to update property status."
        );
        return;
      }

      setProperties((currentProperties) =>
        currentProperties.map((property) =>
          property._id === propertyId
            ? {
                ...property,
                isAvailable: newStatus,
              }
            : property
        )
      );

      Alert.alert(
        "Status Updated",
        newStatus
          ? "Property is now Available."
          : "Property is now Occupied."
      );
    } catch (error) {
      console.error(
        "Availability update error:",
        error
      );

      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  const deleteProperty = async (
    propertyId: string
  ) => {
    try {
      setDeletingPropertyId(propertyId);

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Delete failed",
          data?.message ||
            "Unable to delete property."
        );
        return;
      }

      setProperties((currentProperties) =>
        currentProperties.filter(
          (property) =>
            property._id !== propertyId
        )
      );

      Alert.alert(
        "Property Deleted",
        "Property has been deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const confirmDelete = (
    propertyId: string,
    propertyTitle: string
  ) => {
    Alert.alert(
      "Delete Property",
      `Are you sure you want to delete "${propertyTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteProperty(propertyId),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAuthSession();
              router.replace("/owner-login" as any);
            } catch (error) {
              console.error(
                "Owner logout error:",
                error
              );

              Alert.alert(
                "Logout Failed",
                "Unable to logout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchOwnerProperties();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallScreen ? 18 : 26,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#635BFF"
            colors={["#635BFF"]}
          />
        }
      >
        <View
          style={[
            styles.pageContent,
            {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
        {/* HEADER */}
        <View
          style={[
            styles.topHeader,
            isSmallScreen && styles.topHeaderSmall,
          ]}
        >
          <View style={styles.brandWrap}>
            <View style={styles.brandLogo}>
              <Ionicons
                name="home"
                size={19}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.brand}>
                StayRent
              </Text>

              <Text style={styles.brandCaption}>
                Owner dashboard
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#F04438"
            />
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View
          style={[
            styles.heroCard,
            isSmallScreen && styles.heroCardSmall,
          ]}
        >
          <View style={styles.heroGlow} />

          <View style={styles.heroBadge}>
            <Ionicons
              name="business-outline"
              size={15}
              color="#D9D6FE"
            />

            <Text style={styles.heroBadgeText}>
              OWNER PORTFOLIO
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
            ]}
          >
            Manage your{"\n"}
            rental properties.
          </Text>

          <Text style={styles.subtitle}>
            Add listings, update availability,
            edit details and keep everything
            organized from one place.
          </Text>

          <View style={styles.heroSummaryRow}>
            <View style={styles.heroSummaryItem}>
              <Text style={styles.heroSummaryNumber}>
                {properties.length}
              </Text>
              <Text style={styles.heroSummaryLabel}>
                Total
              </Text>
            </View>

            <View style={styles.heroSummaryDivider} />

            <View style={styles.heroSummaryItem}>
              <Text style={styles.heroSummaryNumber}>
                {
                  properties.filter(
                    (property) =>
                      property.isAvailable
                  ).length
                }
              </Text>
              <Text style={styles.heroSummaryLabel}>
                Available
              </Text>
            </View>

            <View style={styles.heroSummaryDivider} />

            <View style={styles.heroSummaryItem}>
              <Text style={styles.heroSummaryNumber}>
                {
                  properties.filter(
                    (property) =>
                      !property.isAvailable
                  ).length
                }
              </Text>
              <Text style={styles.heroSummaryLabel}>
                Occupied
              </Text>
            </View>
          </View>
        </View>

        {/* ADD PROPERTY */}
        <TouchableOpacity
          style={[
            styles.addButton,
            isSmallScreen && styles.addButtonSmall,
          ]}
          activeOpacity={0.9}
          onPress={() =>
            router.push("/owner-add-property")
          }
        >
          <View style={styles.addButtonIcon}>
            <Ionicons
              name="add"
              size={22}
              color="#635BFF"
            />
          </View>

          <View style={styles.addButtonTextWrap}>
            <Text style={styles.addButtonText}>
              Add New Property
            </Text>

            <Text style={styles.addButtonSubtext}>
              Create a new rental listing
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* SECTION */}
        <View
          style={[
            styles.sectionHeader,
            isSmallScreen && styles.sectionHeaderSmall,
          ]}
        >
          <View>
            <Text style={styles.sectionEyebrow}>
              YOUR LISTINGS
            </Text>

            <Text style={styles.sectionTitle}>
              My Properties
            </Text>
          </View>

          {!loading && error === "" && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {properties.length}
              </Text>
            </View>
          )}
        </View>

        {loading && (
          <View style={styles.centerBox}>
            <View style={styles.loadingIconBox}>
              <ActivityIndicator
                size="small"
                color="#635BFF"
              />
            </View>

            <Text style={styles.loadingTitle}>
              Loading your properties
            </Text>

            <Text style={styles.loadingText}>
              Getting your latest listings...
            </Text>
          </View>
        )}

        {!loading && error !== "" && (
          <View style={styles.centerBox}>
            <View style={styles.errorIconBox}>
              <Ionicons
                name="alert-circle-outline"
                size={29}
                color="#F04438"
              />
            </View>

            <Text style={styles.errorTitle}>
              Unable to load properties
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.9}
              onPress={() => fetchOwnerProperties()}
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
          properties.length === 0 && (
            <View style={styles.centerBox}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="home-outline"
                  size={31}
                  color="#635BFF"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No properties yet
              </Text>

              <Text style={styles.emptyText}>
                Add your first rental property
                to start building your portfolio.
              </Text>
            </View>
          )}

        {!loading &&
          error === "" &&
          properties.map((property) => {
            const imageUrl =
              property.photos &&
              property.photos.length > 0
                ? property.photos[0]
                : null;

            const isUpdating =
              updatingPropertyId ===
              property._id;

            const isDeleting =
              deletingPropertyId ===
              property._id;

            const moderationStatus =
              property.moderationStatus ||
              (property.isVerified ? "approved" : "pending");

            const moderationLabel =
              moderationStatus === "approved"
                ? "Approved"
                : moderationStatus === "rejected"
                ? "Rejected"
                : "Pending Review";

            const moderationIcon =
              moderationStatus === "approved"
                ? "checkmark-circle"
                : moderationStatus === "rejected"
                ? "close-circle"
                : "time";

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
                      style={[
                        styles.propertyImage,
                        isSmallScreen && styles.propertyImageSmall,
                      ]}
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
                          size={31}
                          color="#635BFF"
                        />
                      </View>

                      <Text
                        style={
                          styles.noImageText
                        }
                      >
                        Photo not available
                      </Text>
                    </View>
                  )}

                  <View style={styles.typeBadge}>
                    <Text
                      style={
                        styles.typeBadgeText
                      }
                    >
                      {property.propertyType.toUpperCase()}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusImageBadge,
                      property.isAvailable
                        ? styles.statusImageBadgeAvailable
                        : styles.statusImageBadgeOccupied,
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
                        styles.statusImageBadgeText,
                        property.isAvailable
                          ? styles.availableStatusText
                          : styles.occupiedStatusText,
                      ]}
                    >
                      {property.isAvailable
                        ? "Available"
                        : "Occupied"}
                    </Text>
                  </View>
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

                      <View
                        style={styles.locationRow}
                      >
                        <Ionicons
                          name="location-outline"
                          size={15}
                          color="#98A2B3"
                        />

                        <Text
                          style={
                            styles.locationText
                          }
                          numberOfLines={1}
                        >
                          {property.locality},{" "}
                          {property.city}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rentWrap}>
                      {property.propertyType === "hotel" ? (
                        <>
                          {property.acAvailable &&
                          property.acPricePerDay !== null &&
                          property.acPricePerDay !== undefined ? (
                            <View style={styles.hotelPriceLine}>
                              <Text style={styles.hotelPriceLabel}>
                                AC
                              </Text>

                              <Text style={styles.rent}>
                                ₹{property.acPricePerDay}
                              </Text>

                              <Text style={styles.rentPeriod}>
                                /day
                              </Text>
                            </View>
                          ) : null}

                          {property.nonAcAvailable &&
                          property.nonAcPricePerDay !== null &&
                          property.nonAcPricePerDay !== undefined ? (
                            <View style={styles.hotelPriceLine}>
                              <Text style={styles.hotelPriceLabel}>
                                Non-AC
                              </Text>

                              <Text style={styles.rent}>
                                ₹{property.nonAcPricePerDay}
                              </Text>

                              <Text style={styles.rentPeriod}>
                                /day
                              </Text>
                            </View>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <Text style={styles.rent}>
                            ₹{property.monthlyRent}
                          </Text>

                          <Text
                            style={styles.rentPeriod}
                          >
                            /month
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.badgeRow}>
                    {property.propertyType === "hotel" ? (
                      <>
                        {property.acAvailable ? (
                          <View style={styles.badge}>
                            <Ionicons
                              name="snow-outline"
                              size={13}
                              color="#635BFF"
                            />

                            <Text style={styles.badgeText}>
                              AC
                            </Text>
                          </View>
                        ) : null}

                        {property.nonAcAvailable ? (
                          <View style={styles.badge}>
                            <Ionicons
                              name="bed-outline"
                              size={13}
                              color="#635BFF"
                            />

                            <Text style={styles.badgeText}>
                              Non-AC
                            </Text>
                          </View>
                        ) : null}
                      </>
                    ) : (
                      <View style={styles.badge}>
                        <Ionicons
                          name="person-outline"
                          size={13}
                          color="#635BFF"
                        />

                        <Text
                          style={styles.badgeText}
                        >
                          For {property.availableFor}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.moderationBox,
                      moderationStatus === "approved"
                        ? styles.moderationApprovedBox
                        : moderationStatus === "rejected"
                        ? styles.moderationRejectedBox
                        : styles.moderationPendingBox,
                    ]}
                  >
                    <View style={styles.moderationHeader}>
                      <Ionicons
                        name={moderationIcon}
                        size={18}
                        color={
                          moderationStatus === "approved"
                            ? "#027A48"
                            : moderationStatus === "rejected"
                            ? "#B42318"
                            : "#B54708"
                        }
                      />

                      <Text
                        style={[
                          styles.moderationTitle,
                          moderationStatus === "approved"
                            ? styles.moderationApprovedText
                            : moderationStatus === "rejected"
                            ? styles.moderationRejectedText
                            : styles.moderationPendingText,
                        ]}
                      >
                        {moderationLabel}
                      </Text>
                    </View>

                    {moderationStatus === "pending" && (
                      <Text style={styles.moderationMessage}>
                        Your listing is under admin review. It will be
                        visible to seekers after approval.
                      </Text>
                    )}

                    {moderationStatus === "approved" && (
                      <Text style={styles.moderationMessage}>
                        Your listing is approved and can be shown to
                        seekers while it is available.
                      </Text>
                    )}

                    {moderationStatus === "rejected" && (
                      <>
                        <Text style={styles.moderationMessage}>
                          This listing was rejected. Please edit the
                          property and submit it for review again.
                        </Text>

                        {property.rejectionReason ? (
                          <View style={styles.rejectionReasonBox}>
                            <Text style={styles.rejectionReasonLabel}>
                              Reason
                            </Text>

                            <Text style={styles.rejectionReasonText}>
                              {property.rejectionReason}
                            </Text>
                          </View>
                        ) : null}
                      </>
                    )}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.actionsGrid}>
                    <TouchableOpacity
                      style={styles.editButton}
                      activeOpacity={0.85}
                      disabled={
                        isUpdating ||
                        isDeleting
                      }
                      onPress={(event) => {
                        event.stopPropagation();

                        router.push({
                          pathname:
                            "/owner-edit-property",
                          params: {
                            propertyId:
                              property._id,
                          },
                        });
                      }}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#635BFF"
                      />

                      <Text
                        style={
                          styles.editButtonText
                        }
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        property.isAvailable
                          ? styles.markOccupiedButton
                          : styles.markAvailableButton,
                        isUpdating &&
                          styles.statusButtonDisabled,
                      ]}
                      activeOpacity={0.85}
                      disabled={
                        isUpdating ||
                        isDeleting
                      }
                      onPress={(event) => {
                        event.stopPropagation();

                        updateAvailability(
                          property._id,
                          property.isAvailable
                        );
                      }}
                    >
                      {isUpdating ? (
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />
                      ) : (
                        <>
                          <Ionicons
                            name={
                              property.isAvailable
                                ? "close-circle-outline"
                                : "checkmark-circle-outline"
                            }
                            size={18}
                            color="#FFFFFF"
                          />

                          <Text
                            style={
                              styles.statusButtonText
                            }
                          >
                            {property.isAvailable
                              ? "Occupied"
                              : "Available"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      isDeleting &&
                        styles.deleteButtonDisabled,
                    ]}
                    activeOpacity={0.85}
                    disabled={
                      isDeleting ||
                      isUpdating
                    }
                    onPress={(event) => {
                      event.stopPropagation();

                      confirmDelete(
                        property._id,
                        property.title
                      );
                    }}
                  >
                    {isDeleting ? (
                      <ActivityIndicator
                        size="small"
                        color="#F04438"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#F04438"
                        />

                        <Text
                          style={
                            styles.deleteButtonText
                          }
                        >
                          Delete Property
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -120,
    right: -120,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 30,
    left: -155,
    backgroundColor: "#F5F3FF",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 125,
  },

  pageContent: {
    width: "100%",
    alignSelf: "center",
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },

  topHeaderSmall: {
    alignItems: "flex-start",
  },

  brandWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#635BFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#635BFF",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  brand: {
    marginLeft: 11,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#111827",
  },

  brandCaption: {
    marginLeft: 11,
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
    color: "#98A2B3",
  },

  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F4",
    borderWidth: 1,
    borderColor: "#FEE4E2",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    padding: 22,
    borderRadius: 26,
    backgroundColor: "#111827",
  },

  heroCardSmall: {
    padding: 18,
    borderRadius: 22,
  },

  heroGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -75,
    right: -70,
    backgroundColor: "#312E81",
    opacity: 0.7,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  heroBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#E9E7FF",
  },

  title: {
    marginTop: 18,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.9,
    color: "#FFFFFF",
  },

  titleSmall: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 11,
    maxWidth: 305,
    fontSize: 13,
    lineHeight: 21,
    color: "#C7CDD8",
  },

  heroSummaryRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  heroSummaryItem: {
    flex: 1,
  },

  heroSummaryNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroSummaryLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "700",
    color: "#98A2B3",
  },

  heroSummaryDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
    backgroundColor: "#344054",
  },

  addButton: {
    minHeight: 68,
    marginTop: 14,
    paddingHorizontal: 12,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.2,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },

  addButtonSmall: {
    minHeight: 62,
    borderRadius: 17,
  },

  addButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  addButtonTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  addButtonSubtext: {
    marginTop: 3,
    fontSize: 10,
    color: "#DDD9FF",
  },

  sectionHeader: {
    marginTop: 34,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },

  sectionHeaderSmall: {
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  sectionTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#111827",
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#635BFF",
  },

  centerBox: {
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
    width: 56,
    height: 56,
    borderRadius: 19,
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
    width: 60,
    height: 60,
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
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
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

  propertyImageSmall: {
    height: 175,
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

  typeBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(17,24,39,0.84)",
  },

  typeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#FFFFFF",
  },

  statusImageBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusImageBadgeAvailable: {
    backgroundColor: "rgba(236,253,243,0.96)",
    borderColor: "#ABEFC6",
  },

  statusImageBadgeOccupied: {
    backgroundColor: "rgba(255,241,240,0.96)",
    borderColor: "#FECDCA",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  availableDot: {
    backgroundColor: "#12B76A",
  },

  occupiedDot: {
    backgroundColor: "#F04438",
  },

  statusImageBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  availableStatusText: {
    color: "#027A48",
  },

  occupiedStatusText: {
    color: "#B42318",
  },

  propertyContent: {
    padding: 17,
  },

  propertyContentSmall: {
    padding: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  topRowSmall: {
    flexDirection: "column",
  },

  titleWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  titleWrapSmall: {
    width: "100%",
    paddingRight: 0,
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

  rentWrapSmall: {
    marginTop: 10,
    alignItems: "flex-start",
  },

  hotelPriceLine: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end",
    gap: 4,
    marginBottom: 3,
  },

  hotelPriceLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#667085",
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

  badgeRow: {
    marginTop: 14,
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

  moderationBox: {
    marginTop: 14,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },

  moderationApprovedBox: {
    backgroundColor: "#ECFDF3",
    borderColor: "#ABEFC6",
  },

  moderationPendingBox: {
    backgroundColor: "#FFFAEB",
    borderColor: "#FEDF89",
  },

  moderationRejectedBox: {
    backgroundColor: "#FFF1F0",
    borderColor: "#FECDCA",
  },

  moderationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  moderationTitle: {
    fontSize: 12,
    fontWeight: "900",
  },

  moderationApprovedText: {
    color: "#027A48",
  },

  moderationPendingText: {
    color: "#B54708",
  },

  moderationRejectedText: {
    color: "#B42318",
  },

  moderationMessage: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 16,
    color: "#667085",
  },

  rejectionReasonBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECDCA",
  },

  rejectionReasonLabel: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#B42318",
  },

  rejectionReasonText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    color: "#344054",
  },

  divider: {
    height: 1,
    marginVertical: 15,
    backgroundColor: "#F0F1F4",
  },

  actionsGrid: {
    flexDirection: "row",
    gap: 9,
  },

  actionsGridSmall: {
    flexDirection: "column",
  },

  editButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    backgroundColor: "#F8F7FF",
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#635BFF",
  },

  statusButton: {
    flex: 1.35,
    height: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  actionButtonSmall: {
    width: "100%",
    flex: 0,
  },

  markOccupiedButton: {
    backgroundColor: "#F79009",
  },

  markAvailableButton: {
    backgroundColor: "#12B76A",
  },

  statusButtonDisabled: {
    opacity: 0.6,
  },

  statusButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  deleteButton: {
    height: 46,
    marginTop: 9,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECDCA",
    backgroundColor: "#FFF8F7",
  },

  deleteButtonDisabled: {
    opacity: 0.6,
  },

  deleteButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F04438",
  },
});
