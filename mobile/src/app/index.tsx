import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  getAuthToken,
  getAuthUser,
} from "../utils/authStorage";

export default function HomeScreen() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] =
    useState(true);

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(24)
  ).current;

  const buttonAnim = useRef(
    new Animated.Value(0)
  ).current;

  const checkExistingSession = async () => {
    try {
      const token = await getAuthToken();
      const user = await getAuthUser();

      if (!token || !user) {
        return;
      }

      if (user.role === "seeker") {
        router.replace("/seeker-home" as any);
        return;
      }

      if (user.role === "owner") {
        router.replace(
          "/owner-properties" as any
        );
        return;
      }
    } catch (error) {
      console.error(
        "Session check error:",
        error
      );
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (checkingSession) return;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(buttonAnim, {
      toValue: 1,
      duration: 500,
      delay: 350,
      useNativeDriver: true,
    }).start();
  }, [checkingSession]);

 const handleGetStarted = () => {
  router.replace("/role-select");
};

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <Image
              source={require("../../assets/stayrent-logo.jpeg")}
              style={styles.loadingLogoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.loadingBrand}>
            StayRent
          </Text>

          <ActivityIndicator
            size="small"
            color="#635BFF"
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.backgroundGlowOne} />
      <View style={styles.backgroundGlowTwo} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.topArea,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoOuter}>
              <Image
                source={require("../../assets/stayrent-logo.jpeg")}
                style={styles.brandLogoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.brand}>
              StayRent
            </Text>

            <Text style={styles.brandTagline}>
              Find. Rent. Feel at home.
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.visualArea,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.visualGlow} />

          <View style={styles.locationPin}>
            <Ionicons
              name="location"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.buildingsRow}>
            <View
              style={[
                styles.building,
                styles.smallBuilding,
              ]}
            >
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>

              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>

            <View
              style={[
                styles.building,
                styles.tallBuilding,
              ]}
            >
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>

              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>

              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>

            <View style={styles.mainHome}>
              <View style={styles.mainHomeIcon}>
                <Ionicons
                  name="home"
                  size={48}
                  color="#635BFF"
                />
              </View>
            </View>

            <View
              style={[
                styles.building,
                styles.mediumBuilding,
              ]}
            >
              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>

              <View style={styles.windowRow}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>
          </View>

          <View style={styles.road}>
            <View style={styles.roadLine} />
            <View style={styles.roadLine} />
            <View style={styles.roadLine} />
          </View>

          <View style={styles.floatingChip}>
            <View style={styles.greenDot} />

            <Text style={styles.floatingChipText}>
              Rentals near you
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomArea,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          <Text style={styles.eyebrow}>
            YOUR NEXT PLACE STARTS HERE
          </Text>

          <Text style={styles.title}>
             Find a better place to stay
            
          </Text>

          <Text style={styles.subtitle}>
            Discover rooms, PGs and flats near
            the places that matter to you.
          </Text>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Ionicons
                name="location-outline"
                size={17}
                color="#635BFF"
              />

              <Text style={styles.trustText}>
                Nearby
              </Text>
            </View>

            <View style={styles.trustDivider} />

            <View style={styles.trustItem}>
              <Ionicons
                name="heart-outline"
                size={17}
                color="#635BFF"
              />

              <Text style={styles.trustText}>
                Save
              </Text>
            </View>

            <View style={styles.trustDivider} />

            <View style={styles.trustItem}>
              <Ionicons
                name="call-outline"
                size={17}
                color="#635BFF"
              />

              <Text style={styles.trustText}>
                Connect
              </Text>
            </View>
          </View>

          <Animated.View
            style={{
              opacity: buttonAnim,
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text
                style={styles.primaryButtonText}
              >
                Get Started
              </Text>

              <View style={styles.arrowBox}>
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#635BFF"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footerText}>
            Simple rentals. Better choices.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  backgroundGlowOne: {
    position: "absolute",
    top: -110,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#F1EFFF",
  },

  backgroundGlowTwo: {
    position: "absolute",
    bottom: 120,
    left: -130,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#F7F5FF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 22,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#635BFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#635BFF",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  loadingLogoImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
  },

  loadingBrand: {
    marginTop: 15,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: "#111827",
  },

  loader: {
    marginTop: 18,
  },

  topArea: {
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
  },

  logoOuter: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: "#F1EFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  brandLogoImage: {
    width: 68,
    height: 68,
    borderRadius: 22,
  },

  brand: {
    marginTop: 13,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#111827",
  },

  brandTagline: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#635BFF",
  },

  visualArea: {
    flex: 1,
    minHeight: 275,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  visualGlow: {
    position: "absolute",
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: "#F7F5FF",
  },

  locationPin: {
    position: "absolute",
    top: 42,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#635BFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,

    shadowColor: "#635BFF",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  buildingsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    marginTop: 62,
    zIndex: 2,
  },

  building: {
    borderRadius: 10,
    backgroundColor: "#EFEDFF",
    borderWidth: 1,
    borderColor: "#E2DEFF",
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "space-around",
  },

  smallBuilding: {
    width: 50,
    height: 88,
  },

  mediumBuilding: {
    width: 56,
    height: 106,
  },

  tallBuilding: {
    width: 56,
    height: 126,
  },

  windowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  window: {
    width: 9,
    height: 11,
    borderRadius: 3,
    backgroundColor: "#BBB5FF",
  },

  mainHome: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E3FF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  mainHomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#F3F1FF",
    alignItems: "center",
    justifyContent: "center",
  },

  road: {
    width: "88%",
    height: 40,
    marginTop: -7,
    borderRadius: 20,
    backgroundColor: "#F4F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 17,
  },

  roadLine: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D4D4D8",
  },

  floatingChip: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#12B76A",
  },

  floatingChipText: {
    marginLeft: 7,
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
  },

  bottomArea: {
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#635BFF",
  },

  title: {
    marginTop: 9,
    textAlign: "center",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#111827",
  },

  subtitle: {
    marginTop: 11,
    maxWidth: 320,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    color: "#667085",
  },

  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  trustText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
  },

  trustDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 13,
    backgroundColor: "#D0D5DD",
  },

  primaryButton: {
    width: "100%",
    height: 60,
    marginTop: 22,
    borderRadius: 18,
    backgroundColor: "#635BFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#635BFF",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  arrowBox: {
    position: "absolute",
    right: 9,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  footerText: {
    marginTop: 13,
    fontSize: 10,
    fontWeight: "600",
    color: "#98A2B3",
  },
});