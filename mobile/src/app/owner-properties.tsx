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
  isAvailable: boolean;
};

export default function OwnerPropertiesScreen() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const [updatingPropertyId, setUpdatingPropertyId] =
    useState<string | null>(null);

  const [deletingPropertyId, setDeletingPropertyId] =
    useState<string | null>(null);

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
        "Owner properties error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
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

  useFocusEffect(
    useCallback(() => {
      fetchOwnerProperties();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>
          Where Is My Room
        </Text>

        <Text style={styles.title}>
          My Properties
        </Text>

        <Text style={styles.subtitle}>
          Manage all your rental listings from one place.
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() =>
            router.push("/owner-add-property")
          }
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={COLORS.surface}
          />

          <Text style={styles.addButtonText}>
            Add New Property
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Loading your properties...
            </Text>
          </View>
        )}

        {!loading && error !== "" && (
          <View style={styles.centerBox}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color={COLORS.error}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchOwnerProperties}
            >
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
              <Ionicons
                name="home-outline"
                size={42}
                color={COLORS.textSecondary}
              />

              <Text style={styles.emptyTitle}>
                No properties yet
              </Text>

              <Text style={styles.emptyText}>
                Add your first rental property to get started.
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
                    style={styles.noImage}
                  >
                    <Ionicons
                      name="image-outline"
                      size={36}
                      color={
                        COLORS.textSecondary
                      }
                    />
                  </View>
                )}

                <View
                  style={
                    styles.propertyContent
                  }
                >
                  <View
                    style={styles.topRow}
                  >
                    <Text
                      style={
                        styles.propertyTitle
                      }
                      numberOfLines={2}
                    >
                      {property.title}
                    </Text>

                    <Text
                      style={styles.rent}
                    >
                      ₹
                      {
                        property.monthlyRent
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.locationRow
                    }
                  >
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color={
                        COLORS.textSecondary
                      }
                    />

                    <Text
                      style={
                        styles.locationText
                      }
                    >
                      {property.locality},{" "}
                      {property.city}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.badgeRow
                    }
                  >
                    <View
                      style={styles.badge}
                    >
                      <Text
                        style={
                          styles.badgeText
                        }
                      >
                        {property.propertyType.toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={styles.badge}
                    >
                      <Text
                        style={
                          styles.badgeText
                        }
                      >
                        For{" "}
                        {
                          property.availableFor
                        }
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
                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {property.isAvailable
                          ? "Available"
                          : "Occupied"}
                      </Text>
                    </View>
                  </View>

                  {/* EDIT PROPERTY */}

                  <TouchableOpacity
                    style={
                      styles.editButton
                    }
                    activeOpacity={0.85}
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
                      size={19}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.editButtonText
                      }
                    >
                      Edit Property
                    </Text>
                  </TouchableOpacity>

                  {/* AVAILABLE / OCCUPIED */}

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
                        color={
                          COLORS.surface
                        }
                      />
                    ) : (
                      <>
                        <Ionicons
                          name={
                            property.isAvailable
                              ? "close-circle-outline"
                              : "checkmark-circle-outline"
                          }
                          size={19}
                          color={
                            COLORS.surface
                          }
                        />

                        <Text
                          style={
                            styles.statusButtonText
                          }
                        >
                          {property.isAvailable
                            ? "Mark as Occupied"
                            : "Mark as Available"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* DELETE PROPERTY */}

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
                        color={COLORS.error}
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="trash-outline"
                          size={19}
                          color={COLORS.error}
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

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 26,
  },

  addButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    marginBottom: 26,
  },

  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.surface,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryText: {
    color: COLORS.surface,
    fontWeight: "700",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 12,
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: COLORS.textSecondary,
  },

  propertyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
  },

  propertyImage: {
    width: "100%",
    height: 180,
  },

  noImage: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  propertyContent: {
    padding: 16,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  propertyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  rent: {
    fontSize: 18,
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
    color: COLORS.textSecondary,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  badge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  availableBadge: {
    backgroundColor: "#DCFCE7",
  },

  occupiedBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  editButton: {
    height: 48,
    marginTop: 16,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  statusButton: {
    height: 48,
    marginTop: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  markOccupiedButton: {
    backgroundColor: COLORS.error,
  },

  markAvailableButton: {
    backgroundColor: COLORS.success,
  },

  statusButtonDisabled: {
    opacity: 0.6,
  },

  statusButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.surface,
  },

  deleteButton: {
    height: 48,
    marginTop: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.surface,
  },

  deleteButtonDisabled: {
    opacity: 0.6,
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.error,
  },
});