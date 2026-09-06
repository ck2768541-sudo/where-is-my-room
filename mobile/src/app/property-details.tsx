import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
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
import { getAuthToken } from "../utils/authStorage";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Property = {
  _id: string;
  title: string;
  description?: string;

  propertyType: "room" | "pg" | "flat" | "hotel";

  monthlyRent: number;
  securityDeposit?: number;

  availableFor: "anyone" | "male" | "female" | "family";

  furnishing?: string;

  // Hotel fields
  acAvailable?: boolean;
  acPricePerDay?: number | null;
  nonAcAvailable?: boolean;
  nonAcPricePerDay?: number | null;

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
        `"${property?.title}" listed on StayRent.`;

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
      <SafeAreaView style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.centerContainer}>
          <View style={styles.loadingIconBox}>
            <ActivityIndicator
              size="small"
              color="#635BFF"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading property
          </Text>

          <Text style={styles.loadingText}>
            Getting the latest rental details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <TouchableOpacity
          style={styles.errorBackButton}
        onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/seeker-home");
  }
}}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.centerContainer}>
          <View style={styles.errorIconBox}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#F04438"
            />
          </View>

          <Text style={styles.errorTitle}>
            Property unavailable
          </Text>

          <Text style={styles.errorText}>
            {error || "Property not found."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProperty}
            activeOpacity={0.9}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
        onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/seeker-home");
  }
}}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.brandLogo}>
              <Ionicons
                name="home"
                size={16}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.brand}>
              StayRent
            </Text>
          </View>
        </View>

        <View style={styles.galleryShell}>
          {property.photos &&
          property.photos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.photoSlider}
            >
              {property.photos.map(
                (photo, index) => (
                  <View
                    key={`${photo}-${index}`}
                    style={styles.photoPage}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.propertyImage}
                      resizeMode="cover"
                    />

                    <View style={styles.photoCounter}>
                      <Ionicons
                        name="images-outline"
                        size={14}
                        color="#FFFFFF"
                      />

                      <Text style={styles.photoCounterText}>
                        {index + 1}/{property.photos?.length}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </ScrollView>
          ) : (
            <View style={styles.noPhoto}>
              <View style={styles.noPhotoIconBox}>
                <Ionicons
                  name="image-outline"
                  size={33}
                  color="#635BFF"
                />
              </View>

              <Text style={styles.noPhotoTitle}>
                No property photos
              </Text>

              <Text style={styles.noPhotoText}>
                The owner has not uploaded photos yet.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mainContent}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {property.propertyType.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.title}>
            {property.title}
          </Text>

          {property.propertyType === "hotel" ? (
            <View style={styles.hotelPriceSummary}>
              {property.acAvailable &&
              property.acPricePerDay !== null &&
              property.acPricePerDay !== undefined ? (
                <View style={styles.hotelPriceChip}>
                  <Ionicons
                    name="snow-outline"
                    size={15}
                    color="#635BFF"
                  />

                  <Text style={styles.hotelPriceChipLabel}>
                    AC
                  </Text>

                  <Text style={styles.hotelPriceChipValue}>
                    ₹{property.acPricePerDay}/day
                  </Text>
                </View>
              ) : null}

              {property.nonAcAvailable &&
              property.nonAcPricePerDay !== null &&
              property.nonAcPricePerDay !== undefined ? (
                <View style={styles.hotelPriceChip}>
                  <Ionicons
                    name="bed-outline"
                    size={15}
                    color="#635BFF"
                  />

                  <Text style={styles.hotelPriceChipLabel}>
                    Non-AC
                  </Text>

                  <Text style={styles.hotelPriceChipValue}>
                    ₹{property.nonAcPricePerDay}/day
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.priceRow}>
              <Text style={styles.rent}>
                ₹{property.monthlyRent}
              </Text>

              <Text style={styles.rentPeriod}>
                / month
              </Text>
            </View>
          )}

          <View style={styles.locationRow}>
            <View style={styles.locationIconBox}>
              <Ionicons
                name="location-outline"
                size={17}
                color="#635BFF"
              />
            </View>

            <Text style={styles.locationText}>
              {property.locality}, {property.city}
            </Text>
          </View>

          {property.propertyType !== "hotel" ? (
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color="#635BFF"
                />

                <Text style={styles.badgeText}>
                  For {property.availableFor}
                </Text>
              </View>

              {property.furnishing && (
                <View style={styles.badge}>
                  <Ionicons
                    name="bed-outline"
                    size={14}
                    color="#635BFF"
                  />

                  <Text style={styles.badgeText}>
                    {property.furnishing}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                COST
              </Text>
              <Text style={styles.sectionTitle}>
                Price details
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="wallet-outline"
                size={19}
                color="#635BFF"
              />
            </View>
          </View>

          {property.propertyType === "hotel" ? (
            <View style={styles.detailCard}>
              {property.acAvailable &&
              property.acPricePerDay !== null &&
              property.acPricePerDay !== undefined ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelWrap}>
                    <View style={styles.detailMiniIcon}>
                      <Ionicons
                        name="snow-outline"
                        size={16}
                        color="#635BFF"
                      />
                    </View>

                    <Text style={styles.detailLabel}>
                      AC price per day
                    </Text>
                  </View>

                  <Text style={styles.detailValue}>
                    ₹{property.acPricePerDay}
                  </Text>
                </View>
              ) : null}

              {property.acAvailable &&
              property.acPricePerDay !== null &&
              property.acPricePerDay !== undefined &&
              property.nonAcAvailable &&
              property.nonAcPricePerDay !== null &&
              property.nonAcPricePerDay !== undefined ? (
                <View style={styles.divider} />
              ) : null}

              {property.nonAcAvailable &&
              property.nonAcPricePerDay !== null &&
              property.nonAcPricePerDay !== undefined ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelWrap}>
                    <View style={styles.detailMiniIcon}>
                      <Ionicons
                        name="bed-outline"
                        size={16}
                        color="#635BFF"
                      />
                    </View>

                    <Text style={styles.detailLabel}>
                      Non-AC price per day
                    </Text>
                  </View>

                  <Text style={styles.detailValue}>
                    ₹{property.nonAcPricePerDay}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelWrap}>
                  <View style={styles.detailMiniIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#635BFF"
                    />
                  </View>

                  <Text style={styles.detailLabel}>
                    Monthly rent
                  </Text>
                </View>

                <Text style={styles.detailValue}>
                  ₹{property.monthlyRent}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailLabelWrap}>
                  <View style={styles.detailMiniIcon}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color="#635BFF"
                    />
                  </View>

                  <Text style={styles.detailLabel}>
                    Security deposit
                  </Text>
                </View>

                <Text style={styles.detailValue}>
                  ₹{property.securityDeposit || 0}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                LOCATION
              </Text>
              <Text style={styles.sectionTitle}>
                Address
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="location-outline"
                size={19}
                color="#635BFF"
              />
            </View>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.addressText}>
              {property.address}
            </Text>

            <Text style={styles.addressSubText}>
              {property.locality}, {property.city},{" "}
              {property.state} - {property.pincode}
            </Text>
          </View>

          {property.description ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>
                    OVERVIEW
                  </Text>
                  <Text style={styles.sectionTitle}>
                    About this property
                  </Text>
                </View>

                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color="#635BFF"
                  />
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.description}>
                  {property.description}
                </Text>
              </View>
            </>
          ) : null}

          {property.amenities &&
          property.amenities.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>
                    INCLUDED
                  </Text>
                  <Text style={styles.sectionTitle}>
                    Amenities
                  </Text>
                </View>

                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="sparkles-outline"
                    size={19}
                    color="#635BFF"
                  />
                </View>
              </View>

              <View style={styles.amenitiesContainer}>
                {property.amenities.map(
                  (amenity, index) => (
                    <View
                      key={`${amenity}-${index}`}
                      style={styles.amenityBadge}
                    >
                      <View style={styles.amenityCheck}>
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="#FFFFFF"
                        />
                      </View>

                      <Text style={styles.amenityText}>
                        {amenity}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                CONTACT
              </Text>
              <Text style={styles.sectionTitle}>
                Property owner
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#635BFF"
              />
            </View>
          </View>

          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Ionicons
                name="person"
                size={24}
                color="#635BFF"
              />
            </View>

            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>
                {property.owner?.name ||
                  "Property Owner"}
              </Text>

              <View style={styles.ownerVerifiedRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#12B76A"
                />

                <Text style={styles.ownerVerifiedText}>
                  Listed property contact
                </Text>
              </View>

              {property.owner?.phone ? (
                <Text style={styles.ownerContact}>
                  {property.owner.phone}
                </Text>
              ) : null}

              {property.owner?.email ? (
                <Text style={styles.ownerContact}>
                  {property.owner.email}
                </Text>
              ) : null}
            </View>
          </View>

          {property.owner?.phone ? (
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.callButton}
                activeOpacity={0.9}
                onPress={handleCall}
              >
                <Ionicons
                  name="call"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.contactButtonText}>
                  Call Owner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.whatsappButton}
                activeOpacity={0.9}
                onPress={handleWhatsApp}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.contactButtonText}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.safetyNote}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#635BFF"
            />

            <Text style={styles.safetyNoteText}>
              Verify property details directly with
              the owner before making any commitment.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },

  content: {
    paddingBottom: 54,
  },

  glowOne: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -110,
    right: -110,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    left: -140,
    bottom: 20,
    backgroundColor: "#F5F3FF",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  loadingText: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#98A2B3",
  },

  errorBackButton: {
    position: "absolute",
    top: 18,
    left: 20,
    zIndex: 5,
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  errorTitle: {
    marginTop: 17,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    maxWidth: 300,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#667085",
  },

  retryButton: {
    height: 52,
    marginTop: 22,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 16,
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  topBar: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
  },

  brand: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#111827",
  },

  galleryShell: {
    overflow: "hidden",
    backgroundColor: "#EEF0F6",
  },

  photoSlider: {
    width: "100%",
  },

  photoPage: {
    width: SCREEN_WIDTH,
    height: 285,
    position: "relative",
  },

  propertyImage: {
    width: SCREEN_WIDTH,
    height: 285,
    backgroundColor: "#EEF0F6",
  },

  photoCounter: {
    position: "absolute",
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.78)",
  },

  photoCounterText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  noPhoto: {
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F5FF",
  },

  noPhotoIconBox: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  noPhotoTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  noPhotoText: {
    marginTop: 5,
    fontSize: 11,
    color: "#98A2B3",
  },

  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F1EFFF",
  },

  typeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: "#635BFF",
  },

  title: {
    marginTop: 13,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: "#111827",
  },

  hotelPriceSummary: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  hotelPriceChip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  hotelPriceChipLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475467",
  },

  hotelPriceChipValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#635BFF",
  },

  priceRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  rent: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#635BFF",
  },

  rentPeriod: {
    marginLeft: 4,
    marginBottom: 3,
    fontSize: 11,
    fontWeight: "600",
    color: "#98A2B3",
  },

  locationRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  locationIconBox: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  locationText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#667085",
  },

  badgeRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  badge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475467",
    textTransform: "capitalize",
  },

  sectionHeader: {
    marginTop: 30,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  sectionTitle: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#111827",
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  detailCard: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  detailLabelWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  detailMiniIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F5FF",
  },

  detailLabel: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#667085",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F0F1F4",
  },

  addressText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
    color: "#111827",
  },

  addressSubText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: "#667085",
  },

  description: {
    fontSize: 13,
    lineHeight: 21,
    color: "#667085",
  },

  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  amenityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  amenityCheck: {
    width: 19,
    height: 19,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#12B76A",
  },

  amenityText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475467",
  },

  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  ownerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  ownerInfo: {
    flex: 1,
    marginLeft: 13,
  },

  ownerName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  ownerVerifiedRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  ownerVerifiedText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "700",
    color: "#667085",
  },

  ownerContact: {
    marginTop: 5,
    fontSize: 11,
    color: "#667085",
  },

  contactButtons: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  callButton: {
    flex: 1,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 16,
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  whatsappButton: {
    flex: 1,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 16,
    backgroundColor: "#12B76A",
  },

  contactButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  safetyNote: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#F7F5FF",
  },

  safetyNoteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    color: "#667085",
  },
});
