import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MapView, {
  Callout,
  Marker,
  Region,
} from "react-native-maps";

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { getAuthToken } from "../utils/authStorage";

type Property = {
  _id: string;
  title: string;
  monthlyRent: number;
  locality: string;
  city: string;

  location?: {
    type: "Point";
    coordinates: number[];
  };
};

export default function SeekerMapScreen() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);

  const [region, setRegion] = useState<Region | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError("");

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError(
          "Location permission is required to use the map."
        );
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

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      const token = await getAuthToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/properties`,
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
            "Unable to load properties."
        );
        return;
      }

      const validProperties = Array.isArray(data.properties)
        ? data.properties.filter(
            (property: Property) =>
              property.location?.coordinates?.length === 2
          )
        : [];

      setProperties(validProperties);
    } catch (error) {
      console.error(
        "Map loading error:",
        error
      );

      setError(
        "Unable to load map."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading map...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !region) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons
            name="map-outline"
            size={46}
            color={COLORS.textSecondary}
          />

          <Text style={styles.errorText}>
            {error || "Unable to load map."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadMapData}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>
            Map View
          </Text>

          <Text style={styles.headerSubtitle}>
            Properties near your location
          </Text>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {properties.map((property) => {
          const coordinates =
            property.location?.coordinates;

          if (!coordinates) {
            return null;
          }

          const longitude =
            coordinates[0];

          const latitude =
            coordinates[1];

          return (
            <Marker
              key={property._id}
              coordinate={{
                latitude,
                longitude,
              }}
            >
              <Callout
                onPress={() =>
                  router.push({
                    pathname: "/property-details",
                    params: {
                      propertyId: property._id,
                    },
                  })
                }
              >
                <View style={styles.callout}>
                  <Text style={styles.propertyTitle}>
                    {property.title}
                  </Text>

                  <Text style={styles.rent}>
                    ₹{property.monthlyRent} / month
                  </Text>

                  <Text style={styles.locationText}>
                    {property.locality}, {property.city}
                  </Text>

                  <Text style={styles.viewDetails}>
                    View Details
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  map: {
    flex: 1,
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
    color: COLORS.textSecondary,
  },

  errorText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    color: COLORS.error,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },

  retryText: {
    color: COLORS.surface,
    fontWeight: "700",
  },

  callout: {
    width: 190,
    padding: 5,
  },

  propertyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  rent: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 5,
  },

  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  viewDetails: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 8,
  },
});