import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { COLORS } from "../constants/colors";
import {
  getAuthToken,
  getAuthUser,
} from "../utils/authStorage";

export default function HomeScreen() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] =
    useState(true);

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

  const handleGetStarted = () => {
    router.push("/role-select");
  };

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F7F9FC"
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <Ionicons
              name="home"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.loader}
          />

          <Text style={styles.loadingText}>
            Loading StayRent...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      <View style={styles.backgroundCircleOne} />
      <View style={styles.backgroundCircleTwo} />

      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <View style={styles.brandWrap}>
              <View style={styles.logo}>
                <Ionicons
                  name="home"
                  size={22}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.brand}>
                StayRent
              </Text>
            </View>

            <View style={styles.secureBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color={COLORS.primary}
              />

              <Text style={styles.secureText}>
                Trusted rentals
              </Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>
              FIND YOUR NEXT SPACE
            </Text>

            <Text style={styles.title}>
              Rent smarter.
              {"\n"}
              Live better.
            </Text>

            <Text style={styles.subtitle}>
              Discover rooms, PGs and rental
              spaces near the places that matter
              to you.
            </Text>
          </View>

          <View style={styles.visualCard}>
            <View style={styles.visualTop}>
              <View style={styles.houseIllustration}>
                <View style={styles.houseRoof}>
                  <Ionicons
                    name="business-outline"
                    size={40}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.featureBadge}>
                <Ionicons
                  name="location"
                  size={14}
                  color={COLORS.primary}
                />

                <Text style={styles.featureBadgeText}>
                  Near you
                </Text>
              </View>
            </View>

            <View style={styles.visualContent}>
              <View style={styles.visualTextArea}>
                <Text style={styles.propertyLabel}>
                  Rental discovery
                </Text>

                <Text style={styles.propertyTitle}>
                  Find spaces that fit your life
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="home-outline"
                      size={15}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.metaText}>
                      Room
                    </Text>
                  </View>

                  <View style={styles.dot} />

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="bed-outline"
                      size={15}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.metaText}>
                      PG
                    </Text>
                  </View>

                  <View style={styles.dot} />

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="business-outline"
                      size={15}
                      color={COLORS.textSecondary}
                    />

                    <Text style={styles.metaText}>
                      Flat
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={COLORS.primary}
                  style={{
                    transform: [
                      {
                        rotate: "45deg",
                      },
                    ],
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <View style={styles.quickIcon}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.quickText}>
                Search fast
              </Text>
            </View>

            <View style={styles.quickInfoItem}>
              <View style={styles.quickIcon}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.quickText}>
                Explore nearby
              </Text>
            </View>

            <View style={styles.quickInfoItem}>
              <View style={styles.quickIcon}>
                <Ionicons
                  name="key-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.quickText}>
                List rentals
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>
              Get Started
            </Text>

            <View style={styles.buttonArrow}>
              <Ionicons
                name="arrow-forward"
                size={19}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Find it. Rent it. Feel at home.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  backgroundCircleOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#EAF1FF",
    top: -95,
    right: -110,
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#EEF4FF",
    bottom: 90,
    left: -130,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  loader: {
    marginTop: 24,
  },

  loadingText: {
    marginTop: 13,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    justifyContent: "space-between",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  brand: {
    marginLeft: 11,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.6,
    color: COLORS.textPrimary,
  },

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EAF0",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  secureText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  hero: {
    marginTop: 42,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: COLORS.primary,
  },

  title: {
    marginTop: 13,
    fontSize: 47,
    lineHeight: 51,
    letterSpacing: -2,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 17,
    maxWidth: 330,
    fontSize: 16,
    lineHeight: 25,
    color: COLORS.textSecondary,
  },

  visualCard: {
    marginTop: 32,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",

    shadowColor: "#0F172A",
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 7,
  },

  visualTop: {
    height: 142,
    padding: 18,
    backgroundColor: "#1958D8",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  houseIllustration: {
    position: "absolute",
    left: 22,
    bottom: 19,
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  houseRoof: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  featureBadgeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },

  visualContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  visualTextArea: {
    flex: 1,
  },

  propertyLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLORS.primary,
  },

  propertyTitle: {
    marginTop: 6,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },

  arrowCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
  },

  bottomArea: {
    marginTop: 24,
  },

  quickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  quickInfoItem: {
    alignItems: "center",
    flex: 1,
  },

  quickIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },

  quickText: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  primaryButton: {
    height: 62,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  buttonArrow: {
    position: "absolute",
    right: 10,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
});