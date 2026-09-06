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
import { getAuthToken } from "../utils/authStorage";
import SeekerBottomNav from "../components/SeekerBottomNav";

type Property = {
  _id: string;
  title: string;
  propertyType: "room" | "pg" | "flat" | "hotel";
  monthlyRent: number;
  acAvailable?: boolean;
  acPricePerDay?: number | null;
  nonAcAvailable?: boolean;
  nonAcPricePerDay?: number | null;
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

          const priceHtml =
            property.propertyType === "hotel"
              ? [
                  property.acAvailable &&
                  property.acPricePerDay !== null &&
                  property.acPricePerDay !== undefined
                    ? `<span style="color:#635BFF;font-weight:700;">AC ₹${property.acPricePerDay}/day</span>`
                    : "",
                  property.nonAcAvailable &&
                  property.nonAcPricePerDay !== null &&
                  property.nonAcPricePerDay !== undefined
                    ? `<span style="color:#635BFF;font-weight:700;">Non-AC ₹${property.nonAcPricePerDay}/day</span>`
                    : "",
                ]
                  .filter(Boolean)
                  .join("<br/>")
              : `<span style="color:#635BFF;font-weight:700;">₹${property.monthlyRent}/month</span>`;

          return `
            L.marker([
              ${propertyLatitude},
              ${propertyLongitude}
            ])
            .addTo(map)
            .bindPopup(
              '<div style="font-family: Arial; min-width: 170px;">' +
              '<b style="font-size: 15px;">${safeTitle}</b><br/>' +
              '${priceHtml}<br/>' +
              '<span style="font-size:12px;color:#667085;">${safeLocality}, ${safeCity}</span><br/>' +
              '<button onclick="openProperty(\\'${property._id}\\')" style="margin-top:8px;padding:7px 10px;border:0;border-radius:7px;background:#635BFF;color:white;font-weight:700;">View Details</button>' +
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
            background: #635BFF;
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 2px #635BFF;
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
      <SafeAreaView style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.center}>
          <View style={styles.loadingIconBox}>
            <ActivityIndicator
              size="small"
              color="#635BFF"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Preparing your map
          </Text>

          <Text style={styles.loadingText}>
            Finding your location and nearby rentals...
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
      <SafeAreaView style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.errorHeader}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
       onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/seeker-home");
  }
}}
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
                size={17}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.brand}>
              StayRent
            </Text>
          </View>
        </View>

        <View style={styles.center}>
          <View style={styles.errorIconBox}>
            <Ionicons
              name="map-outline"
              size={30}
              color="#635BFF"
            />
          </View>

          <Text style={styles.errorTitle}>
            Map unavailable
          </Text>

          <Text style={styles.errorText}>
            {error || "Unable to load map."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.9}
            onPress={loadMapData}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#FFFFFF"
            />

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
          activeOpacity={0.8}
        onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/seeker-home");
  }
}}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.eyebrow}>
            EXPLORE NEARBY
          </Text>

          <Text style={styles.title}>
            Map view
          </Text>

          <Text style={styles.subtitle}>
            {properties.length} mapped{" "}
            {properties.length === 1
              ? "property"
              : "properties"}{" "}
            near your location
          </Text>
        </View>

        <View style={styles.locationBadge}>
          <Ionicons
            name="navigate"
            size={18}
            color="#635BFF"
          />
        </View>
      </View>

      <View style={styles.mapShell}>
        <WebView
          style={styles.webView}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          onMessage={(event) => {
            try {
              const message = JSON.parse(
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

        <View
          style={styles.mapInfoPill}
          pointerEvents="none"
        >
          <View style={styles.userDot} />

          <Text style={styles.mapInfoText}>
            Blue marker is your location
          </Text>
        </View>
      </View>

      <SeekerBottomNav />
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
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -120,
    right: -110,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    left: -130,
    bottom: 10,
    backgroundColor: "#F5F3FF",
  },

  header: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EAF2",
  },

  errorHeader: {
    position: "absolute",
    top: 18,
    left: 20,
    right: 20,
    zIndex: 5,
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
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
  },

  brand: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#111827",
  },

  headerTextWrap: {
    flex: 1,
    marginLeft: 13,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  title: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#111827",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#98A2B3",
  },

  locationBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  mapShell: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#EEF0F6",
  },

  webView: {
    flex: 1,
    backgroundColor: "#EEF0F6",
  },

  mapInfoPill: {
    position: "absolute",
    left: 16,
    bottom: 95,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#E8EAF2",

    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  userDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#635BFF",
  },

  mapInfoText: {
    marginLeft: 7,
    fontSize: 10,
    fontWeight: "700",
    color: "#475467",
  },

  center: {
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
    marginTop: 17,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  loadingText: {
    marginTop: 7,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#98A2B3",
  },

  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
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
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
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

  retryText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
