import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { WebView } from "react-native-webview";

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

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

      setLatitude(
        currentLocation.coords.latitude
      );

      setLongitude(
        currentLocation.coords.longitude
      );

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

      const validProperties =
        Array.isArray(data.properties)
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
        "Unable to load map data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const html = useMemo(() => {
    if (
      latitude === null ||
      longitude === null
    ) {
      return "";
    }

    const propertyMarkers =
      properties
        .map((property) => {
          const coordinates =
            property.location?.coordinates;

          if (!coordinates) {
            return "";
          }

          const propertyLongitude =
            coordinates[0];

          const propertyLatitude =
            coordinates[1];

          const safeTitle =
            property.title.replace(
              /'/g,
              "\\'"
            );

          const safeLocality =
            property.locality.replace(
              /'/g,
              "\\'"
            );

          const safeCity =
            property.city.replace(
              /'/g,
              "\\'"
            );

          return `
            L.marker([
              ${propertyLatitude},
              ${propertyLongitude}
            ])
            .addTo(map)
            .bindPopup(
              '<div style="font-family: Arial; min-width: 170px;">' +
              '<b style="font-size: 15px;">${safeTitle}</b><br/>' +
              '<span style="color:#2563EB;font-weight:700;">₹${property.monthlyRent}/month</span><br/>' +
              '<span style="font-size:12px;color:#64748B;">${safeLocality}, ${safeCity}</span><br/>' +
              '<button onclick="openProperty(\\'${property._id}\\')" style="margin-top:8px;padding:7px 10px;border:0;border-radius:7px;background:#2563EB;color:white;font-weight:700;">View Details</button>' +
              '</div>'
            );
          `;
        })
        .join("\n");

    return `
      <!DOCTYPE html>

      <html>

      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />

        <style>
          html,
          body,
          #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          body {
            overflow: hidden;
          }

          .user-location-marker {
            width: 18px;
            height: 18px;
            background: #2563EB;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 2px #2563EB;
          }
        </style>
      </head>

      <body>

        <div id="map"></div>

        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        ></script>

        <script>
          const map = L.map(
            'map',
            {
              zoomControl: true
            }
          ).setView(
            [
              ${latitude},
              ${longitude}
            ],
            14
          );

          L.tileLayer(
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxZoom: 19,
              attribution:
                '&copy; OpenStreetMap contributors'
            }
          ).addTo(map);

          const userIcon =
            L.divIcon({
              className: '',
              html:
                '<div class="user-location-marker"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            });

          L.marker(
            [
              ${latitude},
              ${longitude}
            ],
            {
              icon: userIcon
            }
          )
          .addTo(map)
          .bindPopup(
            '<b>Your Location</b>'
          );

          ${propertyMarkers}

          function openProperty(
            propertyId
          ) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: 'OPEN_PROPERTY',
                propertyId: propertyId
              })
            );
          }
        </script>

      </body>

      </html>
    `;
  }, [
    latitude,
    longitude,
    properties,
  ]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading map...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    error ||
    latitude === null ||
    longitude === null
  ) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <Ionicons
            name="map-outline"
            size={46}
            color={
              COLORS.textSecondary
            }
          />

          <Text
            style={styles.errorText}
          >
            {error ||
              "Unable to load map."}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            activeOpacity={0.85}
            onPress={loadMapData}
          >
            <Text
              style={
                styles.retryText
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
      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          activeOpacity={0.8}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={
              COLORS.textPrimary
            }
          />
        </TouchableOpacity>

        <View>
          <Text
            style={
              styles.title
            }
          >
            Map View
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Properties near your location
          </Text>
        </View>
      </View>

      <WebView
        style={styles.webView}
        originWhitelist={["*"]}
        source={{
          html,
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        onMessage={(event) => {
          try {
            const message =
              JSON.parse(
                event.nativeEvent.data
              );

            if (
              message.type ===
                "OPEN_PROPERTY" &&
              message.propertyId
            ) {
              router.push({
                pathname:
                  "/property-details",
                params: {
                  propertyId:
                    message.propertyId,
                },
              });
            }
          } catch (error) {
            console.error(
              "Map message error:",
              error
            );
          }
        }}
      />
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

    header: {
      minHeight: 82,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 18,
      gap: 14,
      backgroundColor:
        COLORS.surface,
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        COLORS.background,
    },

    title: {
      fontSize: 20,
      fontWeight:
        "800",
      color:
        COLORS.textPrimary,
    },

    subtitle: {
      marginTop: 3,
      fontSize: 13,
      color:
        COLORS.textSecondary,
    },

    webView: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
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
      fontSize: 15,
      textAlign:
        "center",
      color:
        COLORS.error,
    },

    retryButton: {
      marginTop: 18,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor:
        COLORS.primary,
    },

    retryText: {
      fontWeight:
        "700",
      color:
        COLORS.surface,
    },
  });