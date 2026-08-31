import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Linking,
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
  description?: string;

  propertyType: "room" | "pg" | "flat";

  monthlyRent: number;
  securityDeposit?: number;

  availableFor: "anyone" | "male" | "female" | "family";

  furnishing?: string;

  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;

  amenities?: string[];
  photos?: string[];

  owner?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

export default function PropertyDetailsScreen() {
  const router = useRouter();

  const { propertyId } = useLocalSearchParams<{
    propertyId: string;
  }>();

  const [property, setProperty] = useState<Property | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError("");

      if (!propertyId) {
        setError("Property ID not found.");
        return;
      }

      const token = await getAuthToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/properties/${propertyId}`,
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
            "Unable to fetch property details."
        );

        return;
      }

      setProperty(data.property);
    } catch (error) {
      console.error(
        "Property details error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const handleCall = async () => {
    const phone = property?.owner?.phone;

    if (!phone) {
      return;
    }

    try {
      const cleanPhone = phone.replace(
        /[^\d+]/g,
        ""
      );

      await Linking.openURL(
        `tel:${cleanPhone}`
      );
    } catch (error) {
      console.error(
        "Call error:",
        error
      );
    }
  };

  const handleWhatsApp = async () => {
    const phone = property?.owner?.phone;

    if (!phone) {
      return;
    }

    try {
      let cleanPhone = phone.replace(
        /\D/g,
        ""
      );

      /*
        MVP India-focused hai.

        Agar database me number already
        91 ke saath stored hai to dobara
        91 add nahi hoga.
      */

      if (
        cleanPhone.length === 10
      ) {
        cleanPhone = `91${cleanPhone}`;
      }

      const message =
        `Hi, I am interested in your property ` +
        `"${property?.title}" listed on Where Is My Room.`;

      const whatsappUrl =
        `https://wa.me/${cleanPhone}?text=` +
        encodeURIComponent(message);

      await Linking.openURL(
        whatsappUrl
      );
    } catch (error) {
      console.error(
        "WhatsApp error:",
        error
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={styles.loadingText}
          >
            Loading property...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={COLORS.error}
          />

          <Text
            style={styles.errorText}
          >
            {error ||
              "Property not found."}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={fetchProperty}
            activeOpacity={0.8}
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              COLORS.textPrimary
            }
          />
        </TouchableOpacity>

        {property.photos &&
        property.photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={
              false
            }
            style={
              styles.photoSlider
            }
          >
            {property.photos.map(
              (photo, index) => (
                <Image
                  key={`${photo}-${index}`}
                  source={{
                    uri: photo,
                  }}
                  style={
                    styles.propertyImage
                  }
                  resizeMode="cover"
                />
              )
            )}
          </ScrollView>
        ) : (
          <View
            style={styles.noPhoto}
          >
            <Ionicons
              name="image-outline"
              size={46}
              color={
                COLORS.textSecondary
              }
            />

            <Text
              style={
                styles.noPhotoText
              }
            >
              No property photos
            </Text>
          </View>
        )}

        <View
          style={styles.mainContent}
        >
          <Text
            style={styles.title}
          >
            {property.title}
          </Text>

          <Text
            style={styles.rent}
          >
            ₹{property.monthlyRent} / month
          </Text>

          <View
            style={
              styles.locationRow
            }
          >
            <Ionicons
              name="location-outline"
              size={20}
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
            style={styles.badgeRow}
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
                {property.availableFor}
              </Text>
            </View>

            {property.furnishing && (
              <View
                style={styles.badge}
              >
                <Text
                  style={
                    styles.badgeText
                  }
                >
                  {property.furnishing}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Price Details
          </Text>

          <View
            style={styles.detailCard}
          >
            <View
              style={
                styles.detailRow
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                Monthly Rent
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                ₹{property.monthlyRent}
              </Text>
            </View>

            <View
              style={styles.divider}
            />

            <View
              style={
                styles.detailRow
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                Security Deposit
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                ₹
                {property.securityDeposit ||
                  0}
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Address
          </Text>

          <View
            style={styles.detailCard}
          >
            <Text
              style={
                styles.addressText
              }
            >
              {property.address}
            </Text>

            <Text
              style={
                styles.addressSubText
              }
            >
              {property.locality},{" "}
              {property.city},{" "}
              {property.state} -{" "}
              {property.pincode}
            </Text>
          </View>

          {property.description ? (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                About this property
              </Text>

              <View
                style={
                  styles.detailCard
                }
              >
                <Text
                  style={
                    styles.description
                  }
                >
                  {property.description}
                </Text>
              </View>
            </>
          ) : null}

          {property.amenities &&
          property.amenities.length >
            0 ? (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Amenities
              </Text>

              <View
                style={
                  styles.amenitiesContainer
                }
              >
                {property.amenities.map(
                  (
                    amenity,
                    index
                  ) => (
                    <View
                      key={`${amenity}-${index}`}
                      style={
                        styles.amenityBadge
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={
                          COLORS.success
                        }
                      />

                      <Text
                        style={
                          styles.amenityText
                        }
                      >
                        {amenity}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </>
          ) : null}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Owner Details
          </Text>

          <View
            style={styles.detailCard}
          >
            <View
              style={styles.ownerRow}
            >
              <Ionicons
                name="person-circle-outline"
                size={42}
                color={
                  COLORS.primary
                }
              />

              <View
                style={
                  styles.ownerInfo
                }
              >
                <Text
                  style={
                    styles.ownerName
                  }
                >
                  {property.owner
                    ?.name ||
                    "Property Owner"}
                </Text>

                {property.owner
                  ?.phone ? (
                  <Text
                    style={
                      styles.ownerContact
                    }
                  >
                    {
                      property.owner
                        .phone
                    }
                  </Text>
                ) : null}

                {property.owner
                  ?.email ? (
                  <Text
                    style={
                      styles.ownerContact
                    }
                  >
                    {
                      property.owner
                        .email
                    }
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {property.owner?.phone ? (
            <View
              style={
                styles.contactButtons
              }
            >
              <TouchableOpacity
                style={
                  styles.callButton
                }
                activeOpacity={0.85}
                onPress={handleCall}
              >
                <Ionicons
                  name="call"
                  size={20}
                  color={
                    COLORS.surface
                  }
                />

                <Text
                  style={
                    styles.contactButtonText
                  }
                >
                  Call Owner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.whatsappButton
                }
                activeOpacity={0.85}
                onPress={
                  handleWhatsApp
                }
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={21}
                  color={
                    COLORS.surface
                  }
                />

                <Text
                  style={
                    styles.contactButtonText
                  }
                >
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    content: {
      paddingBottom: 50,
    },

    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color:
        COLORS.textSecondary,
    },

    errorText: {
      marginTop: 12,
      textAlign: "center",
      fontSize: 16,
      color: COLORS.error,
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 22,
      paddingVertical: 12,
      backgroundColor:
        COLORS.primary,
      borderRadius: 12,
    },

    retryButtonText: {
      color: COLORS.surface,
      fontWeight: "700",
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      marginTop: 18,
      marginLeft: 20,
      marginBottom: 14,
    },

    photoSlider: {
      width: "100%",
    },

    propertyImage: {
      width: 390,
      height: 260,
    },

    noPhoto: {
      height: 240,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        COLORS.surface,
    },

    noPhotoText: {
      marginTop: 8,
      color:
        COLORS.textSecondary,
    },

    mainContent: {
      paddingHorizontal: 24,
      paddingTop: 24,
    },

    title: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "800",
      color:
        COLORS.textPrimary,
    },

    rent: {
      fontSize: 23,
      fontWeight: "800",
      color: COLORS.primary,
      marginTop: 10,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 16,
    },

    locationText: {
      flex: 1,
      fontSize: 15,
      color:
        COLORS.textSecondary,
    },

    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
      marginTop: 18,
    },

    badge: {
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      color:
        COLORS.textPrimary,
      textTransform:
        "capitalize",
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color:
        COLORS.textPrimary,
      marginTop: 30,
      marginBottom: 10,
    },

    detailCard: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 16,
    },

    detailRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      gap: 16,
    },

    detailLabel: {
      fontSize: 15,
      color:
        COLORS.textSecondary,
    },

    detailValue: {
      fontSize: 16,
      fontWeight: "700",
      color:
        COLORS.textPrimary,
    },

    divider: {
      height: 1,
      backgroundColor:
        COLORS.border,
      marginVertical: 14,
    },

    addressText: {
      fontSize: 16,
      fontWeight: "700",
      color:
        COLORS.textPrimary,
    },

    addressSubText: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color:
        COLORS.textSecondary,
    },

    description: {
      fontSize: 15,
      lineHeight: 23,
      color:
        COLORS.textSecondary,
    },

    amenitiesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    amenityBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 12,
    },

    amenityText: {
      fontSize: 13,
      fontWeight: "600",
      color:
        COLORS.textPrimary,
    },

    ownerRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    ownerInfo: {
      flex: 1,
      marginLeft: 12,
    },

    ownerName: {
      fontSize: 17,
      fontWeight: "700",
      color:
        COLORS.textPrimary,
    },

    ownerContact: {
      marginTop: 4,
      fontSize: 14,
      color:
        COLORS.textSecondary,
    },

    contactButtons: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
      marginBottom: 20,
    },

    callButton: {
      flex: 1,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        COLORS.primary,
      borderRadius: 14,
    },

    whatsappButton: {
      flex: 1,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      backgroundColor:
        COLORS.success,
      borderRadius: 14,
    },

    contactButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: COLORS.surface,
    },
  });