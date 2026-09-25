import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { clearAuthSession, getAuthToken } from "../utils/authStorage";
import SeekerBottomNav from "../components/SeekerBottomNav";

type PropertyType = "Room" | "PG" | "Flat" | "Hotel";

type Property = {
  _id: string;

  title: string;

  description?: string;
  amenities?: string[];
  landmark?: string;

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

  isAvailable?: boolean;
  totalUnits?: number;
  availableUnits?: number;
  isVerified?: boolean;
  moderationStatus?: "pending" | "approved" | "rejected";

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
  const { width, height } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const resultsSectionY = useRef(0);
  const latestPropertyRequestRef = useRef(0);

  const isSmallScreen = width < 380 || height < 700;
  const horizontalPadding =
    width < 360 ? 14 : width < 430 ? 18 : 20;
  const contentMaxWidth = 720;

  const [location, setLocation] =
    useState("");

  const [
    propertyType,
    setPropertyType,
  ] = useState<PropertyType | null>(null);

  const [
    properties,
    setProperties,
  ] = useState<Property[]>([]);

  const [
    allProperties,
    setAllProperties,
  ] = useState<Property[]>([]);

  const [
    isSearchTextDirty,
    setIsSearchTextDirty,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [hasLoadedOnce, setHasLoadedOnce] =
    useState(false);

  const [authChecking, setAuthChecking] =
    useState(true);

  const [refreshing, setRefreshing] =
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

  const [
    currentCity,
    setCurrentCity,
  ] = useState("");

  const [
    resolvedLocationQuery,
    setResolvedLocationQuery,
  ] = useState("");

  const [
    resolvedLatitude,
    setResolvedLatitude,
  ] = useState<number | null>(null);

  const [
    resolvedLongitude,
    setResolvedLongitude,
  ] = useState<number | null>(null);

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

  const applyInstantFilters = (
    sourceProperties: Property[],
    searchText: string,
    selectedType: PropertyType | null,
    applyTextFilter = true
  ) => {
    const normalizedSearch = searchText
      .trim()
      .toLowerCase();

    return sourceProperties.filter((property) => {
      const matchesType =
        !selectedType ||
        property.propertyType ===
          selectedType.toLowerCase();

      if (!matchesType) {
        return false;
      }

      if (!applyTextFilter || !normalizedSearch) {
        return true;
      }

      const searchableText = [
        property.title,
        property.description,
        property.locality,
        property.landmark,
        property.city,
        property.address,
        property.state,
        property.pincode,
        property.propertyType,
        property.furnishing,
        property.availableFor,
        ...(Array.isArray(property.amenities)
          ? property.amenities
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  };

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

  const fetchProperties = async (
    options?: {
      citySearch?: string;
      selectedType?: PropertyType | null;
      latitude?: number | null;
      longitude?: number | null;
      searchTextFilter?: string;
      searchQuery?: string;
    },
    showLoading = true
  ) => {
    const requestId =
      latestPropertyRequestRef.current + 1;

    latestPropertyRequestRef.current =
      requestId;

    const shouldShowInitialLoading =
      showLoading && !hasLoadedOnce;

    try {
      if (shouldShowInitialLoading) {
        setLoading(true);
      }

      setError("");

      const token = await getAuthToken();

      if (!token) {
        router.replace("/seeker-login" as any);
        return;
      }

      const citySearch =
        options?.citySearch ?? "";
      const selectedType =
        options?.selectedType !== undefined
          ? options.selectedType
          : propertyType;
      const latitude =
        options?.latitude !== undefined
          ? options.latitude
          : userLatitude;
      const longitude =
        options?.longitude !== undefined
          ? options.longitude
          : userLongitude;
      const searchTextFilter =
        options?.searchTextFilter ?? "";
      const searchQuery =
        options?.searchQuery ?? "";

      const params: string[] = [];

      /*
       * Preferred search mode is coordinates. This works for current
       * location as well as a typed city / area / landmark after
       * geocoding. If geocoding is unavailable, citySearch keeps the
       * old backend city filter as a backward-compatible fallback.
       */
      if (latitude !== null && longitude !== null) {
        params.push(
          `lat=${encodeURIComponent(String(latitude))}`
        );
        params.push(
          `lng=${encodeURIComponent(String(longitude))}`
        );
      } else if (citySearch.trim()) {
        params.push(
          `city=${encodeURIComponent(citySearch.trim())}`
        );
      }

      if (searchQuery.trim()) {
        params.push(
          `search=${encodeURIComponent(searchQuery.trim())}`
        );
      }

      let url = `${API_BASE_URL}/properties`;

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          requestId ===
          latestPropertyRequestRef.current
        ) {
          setError(
            data?.message ||
              "Unable to fetch properties."
          );
        }
        return;
      }

      const fetchedProperties: Property[] =
        Array.isArray(data.properties)
          ? data.properties
          : [];

      if (
        requestId !==
        latestPropertyRequestRef.current
      ) {
        return;
      }

      setAllProperties(fetchedProperties);
      setIsSearchTextDirty(false);
      setProperties(
        applyInstantFilters(
          fetchedProperties,
          searchTextFilter,
          selectedType,
          searchTextFilter.trim().length > 0
        )
      );
      setHasLoadedOnce(true);
    } catch (error) {
      console.error(
        "Fetch properties error:",
        error
      );

      if (
        requestId ===
        latestPropertyRequestRef.current
      ) {
        setError(
          "Unable to connect to the server."
        );
        setHasLoadedOnce(true);
      }
    } finally {
      if (
        shouldShowInitialLoading &&
        requestId ===
          latestPropertyRequestRef.current
      ) {
        setLoading(false);
      }
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log(
          "Location permission denied"
        );

        setCurrentCity("");

        await fetchProperties({
          selectedType: null,
          latitude: null,
          longitude: null,
        });
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const latitude =
        currentLocation.coords.latitude;
      const longitude =
        currentLocation.coords.longitude;

      setUserLatitude(latitude);
      setUserLongitude(longitude);

      try {
        const addresses =
          await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

        const address = addresses[0];
        const detectedCity =
          address?.city?.trim() ||
          address?.subregion?.trim() ||
          "";

        if (detectedCity) {
          setCurrentCity(detectedCity);

          /*
           * Current-location mode = CITY-WIDE search.
           * No 25 km limit here.
           */
          await fetchProperties({
            citySearch: detectedCity,
            selectedType: null,
            latitude: null,
            longitude: null,
          });
          return;
        }
      } catch (reverseGeocodeError) {
        console.error(
          "Reverse geocode current city error:",
          reverseGeocodeError
        );
      }

      /*
       * Safe fallback only if city detection fails:
       * use existing nearby search so home does not break.
       */
      setCurrentCity("");

      await fetchProperties({
        selectedType: null,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error(
        "Seeker location error:",
        error
      );

      setCurrentCity("");

      await fetchProperties({
        citySearch: "",
        selectedType: null,
        latitude: null,
        longitude: null,
      });
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
    let isMounted = true;

    const initializeSeekerHome = async () => {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/seeker-login" as any);
        return;
      }

      if (!isMounted) {
        return;
      }

      setAuthChecking(false);

      getUserLocation();
      fetchFavorites();
    };

    initializeSeekerHome().catch((error) => {
      console.error(
        "Seeker auth check error:",
        error
      );

      router.replace("/seeker-login" as any);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotificationCount();
    }, [])
  );

  const searchByLocationInput = async (
    selectedType: PropertyType | null = propertyType
  ) => {
    const query = location.trim();

    setIsSearchTextDirty(false);

    if (!query) {
      setResolvedLocationQuery("");
      setResolvedLatitude(null);
      setResolvedLongitude(null);

      if (currentCity.trim()) {
        await fetchProperties({
          citySearch: currentCity,
          selectedType,
          latitude: null,
          longitude: null,
        });
      } else {
        await fetchProperties({
          selectedType,
          latitude: userLatitude,
          longitude: userLongitude,
        });
      }

      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
       * Friendly text search:
       * typed city / area / landmark / address / title / amenity etc.
       * ko backend ke global `search` filter se match karaya jata hai.
       * Typed search ke liye geocoding required nahi hai.
       */
      setResolvedLocationQuery(query);
      setResolvedLatitude(null);
      setResolvedLongitude(null);

      await fetchProperties({
        selectedType,
        latitude: null,
        longitude: null,
        searchQuery: query,
      });
    } catch (error) {
      console.error(
        "Property search error:",
        error
      );

      setError(
        "Unable to search properties."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const committedSearch =
        resolvedLocationQuery.trim();

      if (
        committedSearch &&
        committedSearch.toLowerCase() ===
          location.trim().toLowerCase()
      ) {
        await fetchProperties(
          {
            selectedType: propertyType,
            latitude: null,
            longitude: null,
            searchQuery: committedSearch,
          },
          false
        );
      } else if (currentCity.trim()) {
        await fetchProperties(
          {
            citySearch: currentCity,
            selectedType: propertyType,
            latitude: null,
            longitude: null,
            searchTextFilter:
              isSearchTextDirty ? location : "",
          },
          false
        );
      } else {
        await fetchProperties(
          {
            selectedType: propertyType,
            latitude: userLatitude,
            longitude: userLongitude,
            searchTextFilter:
              isSearchTextDirty ? location : "",
          },
          false
        );
      }

      await Promise.all([
        fetchFavorites(),
        fetchUnreadNotificationCount(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(resultsSectionY.current - 12, 0),
        animated: true,
      });
    });

    searchByLocationInput();
  };

  const handlePropertyTypePress = (item: PropertyType | null) => {
    setPropertyType(item);

    setProperties(
      applyInstantFilters(
        allProperties,
        location,
        item,
        isSearchTextDirty
      )
    );
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setIsSearchTextDirty(true);

    setProperties(
      applyInstantFilters(
        allProperties,
        value,
        propertyType,
        true
      )
    );

    if (
      value.trim().toLowerCase() !==
      resolvedLocationQuery.toLowerCase()
    ) {
      setResolvedLocationQuery("");
      setResolvedLatitude(null);
      setResolvedLongitude(null);
    }
  };

  const handleClearLocation = () => {
    setLocation("");
    setIsSearchTextDirty(false);
    setResolvedLocationQuery("");
    setResolvedLatitude(null);
    setResolvedLongitude(null);

    if (currentCity.trim()) {
      fetchProperties({
        citySearch: currentCity,
        selectedType: propertyType,
        latitude: null,
        longitude: null,
      });
    } else {
      fetchProperties({
        selectedType: propertyType,
        latitude: userLatitude,
        longitude: userLongitude,
      });
    }
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

              // Directly replace the protected screen.
              // Avoid dismissAll() because it can briefly refocus
              // an old protected screen after the session is cleared.
              router.replace(
                "/seeker-login" as any
              );
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

  if (authChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authLoadingContainer}>
          <ActivityIndicator
            size="small"
            color="#635BFF"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallScreen ? 18 : 26,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
            ]}
          >
            Find a place{"\n"}that fits your life.
          </Text>

          <Text style={styles.subtitle}>
            Search rooms, PGs, flats and hotels near you
            or in the city you choose.
          </Text>

          <View
            style={[
              styles.heroStatsRow,
              isSmallScreen && styles.heroStatsRowSmall,
            ]}
          >
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
        <View
          style={[
            styles.searchPanel,
            isSmallScreen && styles.searchPanelSmall,
          ]}
        >
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
              placeholder="Search city, area or landmark..."
              placeholderTextColor="#98A2B3"
              value={location}
              onChangeText={handleLocationChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />

            {location.length > 0 && (
              <TouchableOpacity
                onPress={handleClearLocation}
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
            <TouchableOpacity
              style={[
                styles.chip,
                propertyType === null && styles.chipSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => handlePropertyTypePress(null)}
            >
              <Ionicons
                name="apps-outline"
                size={15}
                color={
                  propertyType === null
                    ? "#FFFFFF"
                    : "#667085"
                }
              />

              <Text
                style={[
                  styles.chipText,
                  propertyType === null &&
                    styles.chipTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

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
                  onPress={() =>
                    handlePropertyTypePress(item)
                  }
                >
                  <Ionicons
                    name={
                      item === "Room"
                        ? "home-outline"
                        : item === "PG"
                        ? "bed-outline"
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
        <View
          style={styles.resultsHeader}
          onLayout={(event) => {
            resultsSectionY.current =
              event.nativeEvent.layout.y;
          }}
        >
          <View>
            <Text style={styles.resultsEyebrow}>
              DISCOVER
            </Text>
            <Text
              style={[
                styles.resultsTitle,
                isSmallScreen && styles.resultsTitleSmall,
              ]}
            >
              Available properties
            </Text>
          </View>

          {hasLoadedOnce && (
            <View style={styles.resultsCountBadge}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#635BFF"
                />
              ) : (
                <Text style={styles.resultsCount}>
                  {properties.length}
                </Text>
              )}
            </View>
          )}
        </View>

        {loading &&
          !hasLoadedOnce &&
          properties.length === 0 && (
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

        {!loading &&
          error !== "" &&
          properties.length === 0 && (
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
          hasLoadedOnce &&
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
                Try another location or property type.
              </Text>
            </View>
          )}

        {error === "" &&
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

            const totalUnits =
              Number.isInteger(property.totalUnits) &&
              (property.totalUnits as number) > 0
                ? (property.totalUnits as number)
                : 1;

            const availableUnits =
              Number.isInteger(property.availableUnits) &&
              (property.availableUnits as number) >= 0
                ? Math.min(
                    property.availableUnits as number,
                    totalUnits
                  )
                : property.isAvailable === false
                  ? 0
                  : 1;

            const occupiedUnits =
              totalUnits - availableUnits;

            const isVerifiedProperty =
              property.isVerified === true &&
              property.moderationStatus === "approved";

            return (
              <TouchableOpacity
                key={property._id}
                style={styles.propertyCard}
                activeOpacity={1}
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
                    <View
                      style={[
                        styles.noImageContainer,
                        isSmallScreen && styles.propertyImageSmall,
                      ]}
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

                  {isVerifiedProperty && (
                    <View style={styles.verifiedImageBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#027A48"
                      />

                      <Text style={styles.verifiedImageBadgeText}>
                        Verified
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={styles.propertyContent}
                >
                  <View
                    style={[
                      styles.propertyTopRow,
                      isSmallScreen && styles.propertyTopRowSmall,
                    ]}
                  >
                    <View
                      style={[
                        styles.propertyTitleWrap,
                        isSmallScreen && styles.propertyTitleWrapSmall,
                      ]}
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
                      style={[
                        styles.rentBlock,
                        isSmallScreen && styles.rentBlockSmall,
                      ]}
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

                  <View style={styles.inventoryRow}>
                    <View style={styles.inventoryItem}>
                      <Text style={styles.inventoryValue}>
                        {totalUnits}
                      </Text>

                      <Text style={styles.inventoryLabel}>
                        Total
                      </Text>
                    </View>

                    <View style={styles.inventoryDivider} />

                    <View style={styles.inventoryItem}>
                      <Text
                        style={[
                          styles.inventoryValue,
                          styles.inventoryAvailableText,
                        ]}
                      >
                        {availableUnits}
                      </Text>

                      <Text style={styles.inventoryLabel}>
                        Available
                      </Text>
                    </View>

                    <View style={styles.inventoryDivider} />

                    <View style={styles.inventoryItem}>
                      <Text
                        style={[
                          styles.inventoryValue,
                          styles.inventoryOccupiedText,
                        ]}
                      >
                        {occupiedUnits}
                      </Text>

                      <Text style={styles.inventoryLabel}>
                        Occupied
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View
                    style={[
                      styles.cardBottomRow,
                      isSmallScreen && styles.cardBottomRowSmall,
                    ]}
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
                      style={[
                        styles.viewDetailsButton,
                        isSmallScreen && styles.viewDetailsButtonSmall,
                      ]}
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
        </View>
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

  authLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 22,
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

  titleSmall: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.8,
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
    flexWrap: "wrap",
    rowGap: 8,
  },

  heroStatsRowSmall: {
    marginTop: 17,
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

  searchPanelSmall: {
    padding: 15,
    borderRadius: 22,
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

  rentRangeRowSmall: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
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

  rentDividerSmall: {
    display: "none",
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
    minWidth: 0,
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

  resultsTitleSmall: {
    fontSize: 19,
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

  propertyImageSmall: {
    height: 180,
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

  verifiedImageBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ABEFC6",
    backgroundColor: "rgba(236,253,243,0.96)",
  },

  verifiedImageBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#027A48",
  },

  inventoryRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAECF0",
    backgroundColor: "#F8F9FC",
  },

  inventoryItem: {
    flex: 1,
    alignItems: "center",
  },

  inventoryDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#EAECF0",
  },

  inventoryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  inventoryAvailableText: {
    color: "#027A48",
  },

  inventoryOccupiedText: {
    color: "#B42318",
  },

  inventoryLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "700",
    color: "#667085",
  },

  propertyContent: {
    padding: 17,
  },

  propertyTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  propertyTopRowSmall: {
    flexDirection: "column",
  },

  propertyTitleWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  propertyTitleWrapSmall: {
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

  rentBlock: {
    alignItems: "flex-end",
  },

  rentBlockSmall: {
    marginTop: 12,
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
    gap: 10,
  },

  cardBottomRowSmall: {
    flexDirection: "column",
    alignItems: "stretch",
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

  viewDetailsButtonSmall: {
    alignSelf: "flex-start",
  },

  viewDetailsText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#635BFF",
  },
});
