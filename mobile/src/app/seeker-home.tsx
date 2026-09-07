import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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
import { clearAuthSession, getAuthToken } from "../utils/authStorage";
import SeekerBottomNav from "../components/SeekerBottomNav";

type PropertyType = "Room" | "PG" | "Flat" | "Hotel";

type AvailabilityType =
  | "Anyone"
  | "Male"
  | "Female"
  | "Family";

type DistanceOption = {
  label: string;
  value: number | null;
};

type Property = {
  _id: string;

  title: string;

  propertyType:
    | "room"
    | "pg"
    | "flat"
    | "hotel";

  monthlyRent: number;

  acAvailable?: boolean;
  acPricePerDay?: number | null;
  nonAcAvailable?: boolean;
  nonAcPricePerDay?: number | null;

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

  const [minRent, setMinRent] =
    useState("");

  const [maxRent, setMaxRent] =
    useState("");

  const [
    selectedDistanceKm,
    setSelectedDistanceKm,
  ] = useState<number | null>(null);

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

  const [
    favoritePropertyIds,
    setFavoritePropertyIds,
  ] = useState<string[]>([]);

  const [
    updatingFavoriteId,
    setUpdatingFavoriteId,
  ] = useState<string | null>(null);

  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const propertyTypes: PropertyType[] =
    [
      "Room",
      "PG",
      "Flat",
      "Hotel",
    ];

  const availabilityOptions: AvailabilityType[] =
    [
      "Anyone",
      "Male",
      "Female",
      "Family",
    ];

  const distanceOptions: DistanceOption[] = [
    {
      label: "Any Distance",
      value: null,
    },
    {
      label: "Within 1 km",
      value: 1,
    },
    {
      label: "Within 3 km",
      value: 3,
    },
    {
      label: "Within 5 km",
      value: 5,
    },
    {
      label: "Within 10 km",
      value: 10,
    },
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

          if (propertyType !== "Hotel") {
            params.push(
              `availableFor=${availability.toLowerCase()}`
            );
          }

          if (minRent.trim()) {
            params.push(
              `minRent=${encodeURIComponent(
                minRent.trim()
              )}`
            );
          }

          if (maxRent.trim()) {
            params.push(
              `maxRent=${encodeURIComponent(
                maxRent.trim()
              )}`
            );
          }

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

        const fetchedProperties: Property[] =
          Array.isArray(data.properties)
            ? data.properties
            : [];

        if (
          useFilters &&
          selectedDistanceKm !== null &&
          userLatitude !== null &&
          userLongitude !== null
        ) {
          const distanceFilteredProperties =
            fetchedProperties.filter(
              (property) => {
                const coordinates =
                  property.location?.coordinates;

                if (
                  !coordinates ||
                  coordinates.length !== 2
                ) {
                  return false;
                }

                const propertyLongitude =
                  coordinates[0];

                const propertyLatitude =
                  coordinates[1];

                const distance =
                  getDistanceInKm(
                    userLatitude,
                    userLongitude,
                    propertyLatitude,
                    propertyLongitude
                  );

                return (
                  distance <=
                  selectedDistanceKm
                );
              }
            );

          setProperties(
            distanceFilteredProperties
          );
        } else {
          setProperties(
            fetchedProperties
          );
        }
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

  const fetchFavorites =
    async () => {
      try {
        const token =
          await getAuthToken();

        if (!token) {
          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/favorites`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Fetch favorites failed:",
            data?.message
          );
          return;
        }

        const favorites =
          Array.isArray(
            data.favorites
          )
            ? data.favorites
            : [];

        setFavoritePropertyIds(
          favorites
            .map(
              (
                property: Property
              ) =>
                property._id
            )
            .filter(Boolean)
        );
      } catch (error) {
        console.error(
          "Fetch favorites error:",
          error
        );
      }
    };

  const fetchUnreadNotificationCount =
    async () => {
      try {
        const token =
          await getAuthToken();

        if (!token) {
          setUnreadNotificationCount(0);
          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/notifications`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          return;
        }

        setUnreadNotificationCount(
          Number(data?.unreadCount) || 0
        );
      } catch (error) {
        console.error(
          "Fetch notification count error:",
          error
        );
      }
    };

  const toggleFavorite =
    async (
      propertyId: string
    ) => {
      try {
        setUpdatingFavoriteId(
          propertyId
        );

        const token =
          await getAuthToken();

        if (!token) {
          setError(
            "Please login again."
          );
          return;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/favorites/${propertyId}`,
            {
              method: "PATCH",
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            "Favorite update failed:",
            data?.message
          );
          return;
        }

        setFavoritePropertyIds(
          (
            currentIds
          ) => {
            if (
              data.isFavorite
            ) {
              return currentIds.includes(
                propertyId
              )
                ? currentIds
                : [
                    ...currentIds,
                    propertyId,
                  ];
            }

            return currentIds.filter(
              (id) =>
                id !==
                propertyId
            );
          }
        );
      } catch (error) {
        console.error(
          "Toggle favorite error:",
          error
        );
      } finally {
        setUpdatingFavoriteId(
          null
        );
      }
    };

  useEffect(() => {
    getUserLocation();

    fetchProperties(
      false
    );

    fetchFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotificationCount();
    }, [])
  );

  const handleSearch =
    () => {
      const minValue =
        minRent.trim() === ""
          ? null
          : Number(minRent);

      const maxValue =
        maxRent.trim() === ""
          ? null
          : Number(maxRent);

      if (
        minValue !== null &&
        (!Number.isFinite(minValue) ||
          minValue < 0)
      ) {
        Alert.alert(
          propertyType === "Hotel"
            ? "Invalid Minimum Price"
            : "Invalid Minimum Rent",
          propertyType === "Hotel"
            ? "Please enter a valid minimum per-day price."
            : "Please enter a valid minimum rent."
        );
        return;
      }

      if (
        maxValue !== null &&
        (!Number.isFinite(maxValue) ||
          maxValue < 0)
      ) {
        Alert.alert(
          propertyType === "Hotel"
            ? "Invalid Maximum Price"
            : "Invalid Maximum Rent",
          propertyType === "Hotel"
            ? "Please enter a valid maximum per-day price."
            : "Please enter a valid maximum rent."
        );
        return;
      }

      if (
        minValue !== null &&
        maxValue !== null &&
        minValue > maxValue
      ) {
        Alert.alert(
          propertyType === "Hotel"
            ? "Invalid Price Range"
            : "Invalid Rent Range",
          propertyType === "Hotel"
            ? "Minimum per-day price cannot be greater than maximum per-day price."
            : "Minimum rent cannot be greater than maximum rent."
        );
        return;
      }

      if (
        selectedDistanceKm !== null &&
        (userLatitude === null ||
          userLongitude === null)
      ) {
        Alert.alert(
          "Location Required",
          "Please allow location access and wait for your current location before using the distance filter."
        );
        return;
      }

      fetchProperties(true);
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
              router.replace("/seeker-login" as any);
            } catch (error) {
              console.error(
                "Seeker logout error:",
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* PREMIUM HEADER */}
        <View style={styles.topHeader}>
          <View style={styles.brandWrap}>
            <View style={styles.brandLogo}>
              <Ionicons
                name="home"
                size={19}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.brand}>StayRent</Text>
              <Text style={styles.brandCaption}>
                Find your next stay
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/seeker-favorites" as any)
              }
            >
              <Ionicons
                name="heart-outline"
                size={21}
                color="#635BFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerIconButton,
                styles.notificationButton,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/seeker-notifications" as any)
              }
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#635BFF"
              />

              {unreadNotificationCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.heroBadgeText}>
              RENTALS AROUND YOU
            </Text>
          </View>

          <Text style={styles.title}>
            Find a place{"\n"}that fits your life.
          </Text>

          <Text style={styles.subtitle}>
            Search rooms, PGs, flats and hotels by
            location, budget and distance.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Ionicons
                name="location-outline"
                size={17}
                color="#635BFF"
              />
              <Text style={styles.heroStatText}>
                Nearby
              </Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatItem}>
              <Ionicons
                name="options-outline"
                size={17}
                color="#635BFF"
              />
              <Text style={styles.heroStatText}>
                Smart filters
              </Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatItem}>
              <Ionicons
                name="heart-outline"
                size={17}
                color="#635BFF"
              />
              <Text style={styles.heroStatText}>
                Save
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH + FILTERS */}
        <View style={styles.searchPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>
                DISCOVER
              </Text>
              <Text style={styles.panelTitle}>
                Search rentals
              </Text>
            </View>

            <View style={styles.filterIconBox}>
              <Ionicons
                name="options-outline"
                size={20}
                color="#635BFF"
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>
            Location
          </Text>

          <View style={styles.searchContainer}>
            <View style={styles.searchIconBox}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#635BFF"
              />
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search city"
              placeholderTextColor="#98A2B3"
              value={location}
              onChangeText={setLocation}
            />

            {location.length > 0 && (
              <TouchableOpacity
                onPress={() => setLocation("")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color="#98A2B3"
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.filterTitle}>
            Property type
          </Text>

          <View style={styles.chipRow}>
            {propertyTypes.map((item) => {
              const selected = propertyType === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    selected && styles.chipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setPropertyType(item)}
                >
                  <Ionicons
                    name={
                      item === "Room"
                        ? "home-outline"
                        : item === "PG"
                        ? "bed-outline"
                        : item === "Hotel"
                        ? "business-outline"
                        : "business-outline"
                    }
                    size={15}
                    color={
                      selected
                        ? "#FFFFFF"
                        : "#667085"
                    }
                  />

                  <Text
                    style={[
                      styles.chipText,
                      selected &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {propertyType !== "Hotel" && (
            <>
              <Text style={styles.filterTitle}>
                Available for
              </Text>

              <View style={styles.chipRow}>
                {availabilityOptions.map((item) => {
                  const selected = availability === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        selected && styles.chipSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setAvailability(item)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.filterTitle}>
            {propertyType === "Hotel"
              ? "Per-day price"
              : "Monthly rent"}
          </Text>

          <View style={styles.rentRangeRow}>
            <View style={styles.rentInputContainer}>
              <Text style={styles.currencyText}>₹</Text>
              <TextInput
                style={styles.rentInput}
                placeholder={propertyType === "Hotel" ? "Min price" : "Min rent"}
                placeholderTextColor="#98A2B3"
                keyboardType="numeric"
                value={minRent}
                onChangeText={setMinRent}
                maxLength={7}
              />
            </View>

            <View style={styles.rentDivider}>
              <Text style={styles.rentRangeSeparator}>
                —
              </Text>
            </View>

            <View style={styles.rentInputContainer}>
              <Text style={styles.currencyText}>₹</Text>
              <TextInput
                style={styles.rentInput}
                placeholder={propertyType === "Hotel" ? "Max price" : "Max rent"}
                placeholderTextColor="#98A2B3"
                keyboardType="numeric"
                value={maxRent}
                onChangeText={setMaxRent}
                maxLength={7}
              />
            </View>
          </View>

          <Text style={styles.filterTitle}>
            Distance from you
          </Text>

          <View style={styles.chipRow}>
            {distanceOptions.map((item) => {
              const selected =
                selectedDistanceKm === item.value;

              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.distanceChip,
                    selected &&
                      styles.distanceChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setSelectedDistanceKm(item.value)
                  }
                >
                  <Ionicons
                    name="navigate-outline"
                    size={14}
                    color={
                      selected
                        ? "#FFFFFF"
                        : "#667085"
                    }
                  />

                  <Text
                    style={[
                      styles.distanceChipText,
                      selected &&
                        styles.distanceChipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.9}
            onPress={handleSearch}
          >
            <Ionicons
              name="search"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.searchButtonText}>
              Search Properties
            </Text>

            <View style={styles.searchArrowBox}>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#635BFF"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push("/seeker-map" as any)
            }
          >
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="map-outline"
                size={22}
                color="#635BFF"
              />
            </View>

            <View style={styles.quickActionTextWrap}>
              <Text style={styles.quickActionTitle}>
                Explore map
              </Text>
              <Text style={styles.quickActionText}>
                See nearby listings
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#98A2B3"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push("/seeker-favorites" as any)
            }
          >
            <View style={styles.favoriteActionIcon}>
              <Ionicons
                name="heart-outline"
                size={22}
                color="#F04438"
              />
            </View>

            <View style={styles.quickActionTextWrap}>
              <Text style={styles.quickActionTitle}>
                Saved
              </Text>
              <Text style={styles.quickActionText}>
                View favorites
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#98A2B3"
            />
          </TouchableOpacity>
        </View>

        {/* RESULTS */}
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsEyebrow}>
              DISCOVER
            </Text>
            <Text style={styles.resultsTitle}>
              Available properties
            </Text>
          </View>

          {!loading && (
            <View style={styles.resultsCountBadge}>
              <Text style={styles.resultsCount}>
                {properties.length}
              </Text>
            </View>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIconBox}>
              <ActivityIndicator
                size="small"
                color="#635BFF"
              />
            </View>

            <Text style={styles.loadingTitle}>
              Finding the best places...
            </Text>

            <Text style={styles.loadingText}>
              This will only take a moment.
            </Text>
          </View>
        )}

        {!loading && error !== "" && (
          <View style={styles.messageBox}>
            <View style={styles.errorIconBox}>
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color="#F04438"
              />
            </View>

            <Text style={styles.errorTitle}>
              Something went wrong
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {!loading &&
          error === "" &&
          properties.length === 0 && (
            <View style={styles.messageBox}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="home-outline"
                  size={27}
                  color="#635BFF"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No properties found
              </Text>

              <Text style={styles.emptyText}>
                Try another city or adjust your
                filters.
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

            const hasDistance =
              userLatitude !== null &&
              userLongitude !== null &&
              property.location?.coordinates
                ?.length === 2;

            const distance = hasDistance
              ? getDistanceInKm(
                  userLatitude!,
                  userLongitude!,
                  property.location!.coordinates[1],
                  property.location!.coordinates[0]
                )
              : null;

            const isFavorite =
              favoritePropertyIds.includes(
                property._id
              );

            const isUpdatingFavorite =
              updatingFavoriteId === property._id;

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
                    <View
                      style={
                        styles.noImageContainer
                      }
                    >
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
                        style={styles.noImageText}
                      >
                        Photo not available
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.favoriteButton}
                    activeOpacity={0.85}
                    disabled={isUpdatingFavorite}
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleFavorite(property._id);
                    }}
                  >
                    {isUpdatingFavorite ? (
                      <ActivityIndicator
                        size="small"
                        color="#635BFF"
                      />
                    ) : (
                      <Ionicons
                        name={
                          isFavorite
                            ? "heart"
                            : "heart-outline"
                        }
                        size={22}
                        color={
                          isFavorite
                            ? "#F04438"
                            : "#111827"
                        }
                      />
                    )}
                  </TouchableOpacity>

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
                </View>

                <View
                  style={styles.propertyContent}
                >
                  <View
                    style={styles.propertyTopRow}
                  >
                    <View
                      style={
                        styles.propertyTitleWrap
                      }
                    >
                      <Text
                        style={
                          styles.propertyTitle
                        }
                        numberOfLines={2}
                      >
                        {property.title}
                      </Text>

                      <View
                        style={
                          styles.locationRow
                        }
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

                    <View
                      style={
                        styles.rentBlock
                      }
                    >
                      {property.propertyType === "hotel" ? (
                        <>
                          {property.acAvailable &&
                          property.acPricePerDay !== null &&
                          property.acPricePerDay !== undefined ? (
                            <View style={styles.hotelPriceLine}>
                              <Text style={styles.hotelPriceLabel}>
                                AC
                              </Text>
                              <Text style={styles.propertyRent}>
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
                              <Text style={styles.propertyRent}>
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
                          <Text
                            style={
                              styles.propertyRent
                            }
                          >
                            ₹
                            {property.monthlyRent}
                          </Text>

                          <Text
                            style={
                              styles.rentPeriod
                            }
                          >
                            /month
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View
                    style={
                      styles.cardBottomRow
                    }
                  >
                    <View
                      style={
                        styles.propertyInfoRow
                      }
                    >
                      {property.propertyType === "hotel" ? (
                        <>
                          {property.acAvailable ? (
                            <View style={styles.smallBadge}>
                              <Ionicons
                                name="snow-outline"
                                size={13}
                                color="#635BFF"
                              />
                              <Text style={styles.smallBadgeText}>
                                AC
                              </Text>
                            </View>
                          ) : null}

                          {property.nonAcAvailable ? (
                            <View style={styles.smallBadge}>
                              <Ionicons
                                name="bed-outline"
                                size={13}
                                color="#635BFF"
                              />
                              <Text style={styles.smallBadgeText}>
                                Non-AC
                              </Text>
                            </View>
                          ) : null}
                        </>
                      ) : (
                        <View
                          style={styles.smallBadge}
                        >
                          <Ionicons
                            name="person-outline"
                            size={13}
                            color="#635BFF"
                          />

                          <Text
                            style={
                              styles.smallBadgeText
                            }
                          >
                            {property.availableFor}
                          </Text>
                        </View>
                      )}

                      {distance !== null && (
                        <View
                          style={
                            styles.distanceBadge
                          }
                        >
                          <Ionicons
                            name="navigate-outline"
                            size={13}
                            color="#12B76A"
                          />

                          <Text
                            style={
                              styles.distanceText
                            }
                          >
                            {distance.toFixed(1)} km
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={
                        styles.viewDetailsButton
                      }
                    >
                      <Text
                        style={
                          styles.viewDetailsText
                        }
                      >
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 125,
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  brandWrap: {
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

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  notificationButton: {
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F04438",
    borderWidth: 2,
    borderColor: "#F8F9FD",
  },

  notificationBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  logoutIconButton: {
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
    marginBottom: 18,
  },

  heroGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -70,
    top: -70,
    backgroundColor: "#312E81",
    opacity: 0.65,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#7CFFB2",
  },

  heroBadgeText: {
    marginLeft: 7,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#E9E7FF",
  },

  title: {
    marginTop: 18,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#FFFFFF",
  },

  subtitle: {
    marginTop: 11,
    maxWidth: 305,
    fontSize: 14,
    lineHeight: 22,
    color: "#C7CDD8",
  },

  heroStatsRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  heroStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroStatText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "700",
    color: "#D0D5DD",
  },

  heroStatDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 10,
    backgroundColor: "#475467",
  },

  searchPanel: {
    padding: 18,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 21,
  },

  panelEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#635BFF",
  },

  panelTitle: {
    marginTop: 4,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#111827",
  },

  filterIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  sectionLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
  },

  searchContainer: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 17,
    backgroundColor: "#FBFCFE",
  },

  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  searchInput: {
    flex: 1,
    minHeight: 56,
    marginHorizontal: 10,
    fontSize: 15,
    color: "#111827",
  },

  filterTitle: {
    marginTop: 21,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
  },

  chipSelected: {
    borderColor: "#635BFF",
    backgroundColor: "#635BFF",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475467",
    textTransform: "capitalize",
  },

  chipTextSelected: {
    color: "#FFFFFF",
  },

  distanceChip: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
  },

  distanceChipSelected: {
    borderColor: "#635BFF",
    backgroundColor: "#635BFF",
  },

  distanceChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475467",
  },

  distanceChipTextSelected: {
    color: "#FFFFFF",
  },

  rentRangeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rentInputContainer: {
    flex: 1,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 15,
    backgroundColor: "#FBFCFE",
  },

  currencyText: {
    marginRight: 5,
    fontSize: 15,
    fontWeight: "800",
    color: "#635BFF",
  },

  rentInput: {
    flex: 1,
    minHeight: 52,
    fontSize: 14,
    color: "#111827",
  },

  rentDivider: {
    width: 28,
    alignItems: "center",
  },

  rentRangeSeparator: {
    fontSize: 14,
    fontWeight: "700",
    color: "#98A2B3",
  },

  searchButton: {
    height: 60,
    marginTop: 24,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 5,
  },

  searchButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  searchArrowBox: {
    position: "absolute",
    right: 9,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  quickActionsRow: {
    marginTop: 14,
    gap: 10,
  },

  quickActionCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EAF2",
    backgroundColor: "#FFFFFF",
  },

  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  favoriteActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  quickActionTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  quickActionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  quickActionText: {
    marginTop: 3,
    fontSize: 10,
    color: "#98A2B3",
  },

  resultsHeader: {
    marginTop: 34,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  resultsEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#635BFF",
  },

  resultsTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#111827",
  },

  resultsCountBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  resultsCount: {
    fontSize: 12,
    fontWeight: "900",
    color: "#635BFF",
  },

  loadingContainer: {
    paddingVertical: 36,
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  loadingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  loadingTitle: {
    marginTop: 13,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  loadingText: {
    marginTop: 4,
    fontSize: 11,
    color: "#98A2B3",
  },

  messageBox: {
    padding: 28,
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  errorIconBox: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  errorTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  errorText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#F04438",
  },

  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    marginTop: 6,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
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
    backgroundColor: "#F2F4F7",
  },

  noImageContainer: {
    width: "100%",
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

  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
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

  propertyContent: {
    padding: 17,
  },

  propertyTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  propertyTitleWrap: {
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

  rentBlock: {
    alignItems: "flex-end",
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

  propertyRent: {
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

  cardDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F0F1F4",
  },

  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  propertyInfoRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  smallBadge: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F1EFFF",
  },

  smallBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#635BFF",
    textTransform: "capitalize",
  },

  distanceBadge: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ECFDF3",
  },

  distanceText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#027A48",
  },

  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F8F7FF",
  },

  viewDetailsText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#635BFF",
  },
});
