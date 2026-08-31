import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { getAuthToken } from "../utils/authStorage";

type PropertyType = "Room" | "PG" | "Flat";

type AvailabilityType =
  | "Anyone"
  | "Male"
  | "Female"
  | "Family";

type Property = {
  _id: string;

  title: string;

  propertyType:
    | "room"
    | "pg"
    | "flat";

  monthlyRent: number;

  securityDeposit?: number;

  availableFor:
    | "anyone"
    | "male"
    | "female"
    | "family";

  furnishing?: string;

  address: string;

  locality: string;

  city: string;

  state: string;

  pincode: string;

  photos: string[];

  location?: {
    type: "Point";
    coordinates: number[];
  };

  owner?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

export default function SeekerHomeScreen() {
  const router = useRouter();

  const [location, setLocation] =
    useState("");

  const [
    propertyType,
    setPropertyType,
  ] =
    useState<PropertyType>(
      "Room"
    );

  const [
    availability,
    setAvailability,
  ] =
    useState<AvailabilityType>(
      "Anyone"
    );

  const [
    properties,
    setProperties,
  ] = useState<Property[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    userLatitude,
    setUserLatitude,
  ] =
    useState<number | null>(
      null
    );

  const [
    userLongitude,
    setUserLongitude,
  ] =
    useState<number | null>(
      null
    );

  const propertyTypes: PropertyType[] =
    [
      "Room",
      "PG",
      "Flat",
    ];

  const availabilityOptions: AvailabilityType[] =
    [
      "Anyone",
      "Male",
      "Female",
      "Family",
    ];

  const getDistanceInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (
      value: number
    ) =>
      (value * Math.PI) /
      180;

    const earthRadius =
      6371;

    const dLat = toRad(
      lat2 - lat1
    );

    const dLon = toRad(
      lon2 - lon1
    );

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos(
        toRad(lat1)
      ) *
        Math.cos(
          toRad(lat2)
        ) *
        Math.sin(
          dLon / 2
        ) *
        Math.sin(
          dLon / 2
        );

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return (
      earthRadius * c
    );
  };

  const getUserLocation =
    async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          "granted"
        ) {
          console.log(
            "Location permission denied"
          );

          return;
        }

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location
                  .Accuracy
                  .Balanced,
            }
          );

        setUserLatitude(
          currentLocation
            .coords
            .latitude
        );

        setUserLongitude(
          currentLocation
            .coords
            .longitude
        );
      } catch (
        error
      ) {
        console.error(
          "Seeker location error:",
          error
        );
      }
    };

  const fetchProperties =
    async (
      useFilters =
        false
    ) => {
      try {
        setLoading(true);

        setError("");

        const token =
          await getAuthToken();

        if (!token) {
          setError(
            "Please login again."
          );

          return;
        }

        let url =
          `${API_BASE_URL}/properties`;

        if (
          useFilters
        ) {
          const params: string[] =
            [];

          if (
            location.trim()
          ) {
            params.push(
              `city=${encodeURIComponent(
                location.trim()
              )}`
            );
          }

          params.push(
            `propertyType=${propertyType.toLowerCase()}`
          );

          params.push(
            `availableFor=${availability.toLowerCase()}`
          );

          if (
            params.length >
            0
          ) {
            url +=
              `?${params.join(
                "&"
              )}`;
          }
        }

        const response =
          await fetch(
            url,
            {
              method:
                "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          setError(
            data?.message ||
              "Unable to fetch properties."
          );

          return;
        }

        setProperties(
          Array.isArray(
            data.properties
          )
            ? data.properties
            : []
        );
      } catch (
        error
      ) {
        console.error(
          "Fetch properties error:",
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
    getUserLocation();

    fetchProperties(
      false
    );
  }, []);

  const handleSearch =
    () => {
      fetchProperties(
        true
      );
    };

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={
            styles.brand
          }
        >
          Where Is My Room
        </Text>

        <Text
          style={
            styles.title
          }
        >
          Find your next place
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Search available rooms, PGs and rental properties near your preferred location.
        </Text>

        <Text
          style={
            styles.sectionLabel
          }
        >
          Where do you want to stay?
        </Text>

        <View
          style={
            styles.searchContainer
          }
        >
          <Ionicons
            name="location-outline"
            size={22}
            color={
              COLORS.textSecondary
            }
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search city"
            placeholderTextColor={
              COLORS.textSecondary
            }
            value={
              location
            }
            onChangeText={
              setLocation
            }
          />

          {location.length >
            0 && (
            <TouchableOpacity
              onPress={() =>
                setLocation(
                  ""
                )
              }
              activeOpacity={
                0.7
              }
            >
              <Ionicons
                name="close-circle"
                size={21}
                color={
                  COLORS.textSecondary
                }
              />
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={
            styles.filterTitle
          }
        >
          Property Type
        </Text>

        <View
          style={
            styles.chipRow
          }
        >
          {propertyTypes.map(
            (item) => {
              const selected =
                propertyType ===
                item;

              return (
                <TouchableOpacity
                  key={
                    item
                  }
                  style={[
                    styles.chip,
                    selected &&
                      styles.chipSelected,
                  ]}
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    setPropertyType(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {
                      item
                    }
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <Text
          style={
            styles.filterTitle
          }
        >
          Available For
        </Text>

        <View
          style={
            styles.chipRow
          }
        >
          {availabilityOptions.map(
            (item) => {
              const selected =
                availability ===
                item;

              return (
                <TouchableOpacity
                  key={
                    item
                  }
                  style={[
                    styles.chip,
                    selected &&
                      styles.chipSelected,
                  ]}
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    setAvailability(
                      item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {
                      item
                    }
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <TouchableOpacity
          style={
            styles.searchButton
          }
          activeOpacity={
            0.85
          }
          onPress={
            handleSearch
          }
        >
          <Ionicons
            name="search"
            size={20}
            color={
              COLORS.surface
            }
          />


          

          <Text
            style={
              styles.searchButtonText
            }
          >
            Search Rooms
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.resultsHeader
          }
        >
          <Text
            style={
              styles.resultsTitle
            }
          >
            Available Properties
          </Text>

          {!loading && (
            <Text
              style={
                styles.resultsCount
              }
            >
              {
                properties.length
              }
            </Text>
          )}
        </View>

        {loading && (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Finding properties...
            </Text>
          </View>
        )}

        {!loading &&
          error !== "" && (
            <View
              style={
                styles.messageBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={
                  COLORS.error
                }
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {
                  error
                }
              </Text>
            </View>
          )}

        {!loading &&
          error === "" &&
          properties.length ===
            0 && (
            <View
              style={
                styles.messageBox
              }
            >
              <Ionicons
                name="home-outline"
                size={30}
                color={
                  COLORS.textSecondary
                }
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No properties found
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Try another city or filter.
              </Text>
            </View>
          )}

        {!loading &&
          error === "" &&
          properties.map(
            (
              property
            ) => {
              const imageUrl =
                property.photos &&
                property
                  .photos
                  .length >
                  0
                  ? property
                      .photos[0]
                  : null;

              const hasDistance =
                userLatitude !==
                  null &&
                userLongitude !==
                  null &&
                property
                  .location
                  ?.coordinates
                  ?.length ===
                  2;

              const distance =
                hasDistance
                  ? getDistanceInKm(
                      userLatitude!,
                      userLongitude!,
                      property
                        .location!
                        .coordinates[1],
                      property
                        .location!
                        .coordinates[0]
                    )
                  : null;

              return (
                <TouchableOpacity
                  key={
                    property._id
                  }
                  style={
                    styles.propertyCard
                  }
                  activeOpacity={
                    0.9
                  }
                  onPress={() =>
                    router.push(
                      {
                        pathname:
                          "/property-details",

                        params: {
                          propertyId:
                            property._id,
                        },
                      }
                    )
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
                        styles.noImageContainer
                      }
                    >
                      <Ionicons
                        name="image-outline"
                        size={38}
                        color={
                          COLORS.textSecondary
                        }
                      />

                      <Text
                        style={
                          styles.noImageText
                        }
                      >
                        No photo
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.propertyContent
                    }
                  >
                    <View
                      style={
                        styles.propertyTopRow
                      }
                    >
                      <Text
                        style={
                          styles.propertyTitle
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {
                          property.title
                        }
                      </Text>

                      <Text
                        style={
                          styles.propertyRent
                        }
                      >
                        ₹
                        {
                          property.monthlyRent
                        }
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.rentPeriod
                      }
                    >
                      per month
                    </Text>

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
                        {
                          property.locality
                        }
                        ,{" "}
                        {
                          property.city
                        }
                      </Text>
                    </View>

                    {distance !==
                      null && (
                      <View
                        style={
                          styles.distanceRow
                        }
                      >
                        <Ionicons
                          name="navigate-outline"
                          size={17}
                          color={
                            COLORS.primary
                          }
                        />

                        <Text
                          style={
                            styles.distanceText
                          }
                        >
                          {distance.toFixed(
                            1
                          )}{" "}
                          km away
                        </Text>
                      </View>
                    )}

                    <View
                      style={
                        styles.propertyInfoRow
                      }
                    >
                      <View
                        style={
                          styles.smallBadge
                        }
                      >
                        <Text
                          style={
                            styles.smallBadgeText
                          }
                        >
                          {property.propertyType.toUpperCase()}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.smallBadge
                        }
                      >
                        <Text
                          style={
                            styles.smallBadgeText
                          }
                        >
                          For{" "}
                          {
                            property.availableFor
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          )}
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
      paddingHorizontal: 24,
      paddingTop: 44,
      paddingBottom: 50,
    },

    brand: {
      fontSize: 18,
      fontWeight:
        "700",
      color:
        COLORS.primary,
      marginBottom: 24,
    },

    title: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight:
        "800",
      color:
        COLORS.textPrimary,
    },

    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color:
        COLORS.textSecondary,
      marginTop: 10,
    },

    sectionLabel: {
      fontSize: 16,
      fontWeight:
        "700",
      color:
        COLORS.textPrimary,
      marginTop: 36,
      marginBottom: 10,
    },

    searchContainer: {
      height: 58,
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      paddingHorizontal: 16,
    },

    searchInput: {
      flex: 1,
      height: "100%",
      marginHorizontal: 10,
      fontSize: 16,
      color:
        COLORS.textPrimary,
    },

    filterTitle: {
      fontSize: 15,
      fontWeight:
        "700",
      color:
        COLORS.textPrimary,
      marginTop: 24,
      marginBottom: 10,
    },

    chipRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },

    chip: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 12,
    },

    chipSelected: {
      backgroundColor:
        COLORS.primary,
      borderColor:
        COLORS.primary,
    },

    chipText: {
      fontSize: 14,
      fontWeight:
        "600",
      color:
        COLORS.textPrimary,
    },

    chipTextSelected: {
      color:
        COLORS.surface,
    },

    searchButton: {
      height: 56,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        COLORS.primary,
      borderRadius: 16,
      marginTop: 28,
      gap: 8,
    },

    searchButtonText: {
      fontSize: 17,
      fontWeight:
        "700",
      color:
        COLORS.surface,
    },

    resultsHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginTop: 38,
      marginBottom: 14,
    },

    resultsTitle: {
      fontSize: 20,
      fontWeight:
        "800",
      color:
        COLORS.textPrimary,
    },

    resultsCount: {
      minWidth: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        COLORS.primary,
      color:
        COLORS.surface,
      textAlign:
        "center",
      textAlignVertical:
        "center",
      fontWeight:
        "700",
    },

    loadingContainer: {
      paddingVertical: 40,
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color:
        COLORS.textSecondary,
    },

    messageBox: {
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 24,
      alignItems:
        "center",
      marginBottom: 18,
    },

    errorText: {
      marginTop: 10,
      textAlign:
        "center",
      color:
        COLORS.error,
      fontSize: 15,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight:
        "700",
      color:
        COLORS.textPrimary,
      marginTop: 10,
    },

    emptyText: {
      fontSize: 14,
      color:
        COLORS.textSecondary,
      marginTop: 5,
    },

    propertyCard: {
      backgroundColor:
        COLORS.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      marginBottom: 18,
      overflow:
        "hidden",
    },

    propertyImage: {
      width: "100%",
      height: 190,
    },

    noImageContainer: {
      width: "100%",
      height: 190,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        COLORS.background,
    },

    noImageText: {
      color:
        COLORS.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },

    propertyContent: {
      padding: 16,
    },

    propertyTopRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      gap: 12,
    },

    propertyTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight:
        "800",
      color:
        COLORS.textPrimary,
    },

    propertyRent: {
      fontSize: 20,
      fontWeight:
        "800",
      color:
        COLORS.primary,
    },

    rentPeriod: {
      alignSelf:
        "flex-end",
      marginTop: 2,
      fontSize: 12,
      color:
        COLORS.textSecondary,
    },

    locationRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 14,
      gap: 5,
    },

    locationText: {
      flex: 1,
      fontSize: 14,
      color:
        COLORS.textSecondary,
    },

    distanceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      marginTop: 8,
    },

    distanceText: {
      fontSize: 14,
      fontWeight:
        "700",
      color:
        COLORS.primary,
    },

    propertyInfoRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 8,
      marginTop: 14,
    },

    smallBadge: {
      backgroundColor:
        COLORS.background,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    smallBadgeText: {
      fontSize: 12,
      fontWeight:
        "700",
      color:
        COLORS.textPrimary,
      textTransform:
        "capitalize",
    },
  });