import { useRef } from "react";

import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RoleSelectScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 380 || height < 700;
  const horizontalPadding =
    width < 380 ? 16 : width < 430 ? 20 : 24;
  const contentMaxWidth = 560;

  const seekerScale = useRef(
    new Animated.Value(1)
  ).current;

  const ownerScale = useRef(
    new Animated.Value(1)
  ).current;

  const animatePressIn = (
    animatedValue: Animated.Value
  ) => {
    Animated.spring(animatedValue, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 2,
    }).start();
  };

  const animatePressOut = (
    animatedValue: Animated.Value
  ) => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FD"
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallScreen ? 18 : 28,
            paddingBottom: isSmallScreen ? 18 : 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          <View>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Image
                source={require("../../assets/stayrent-logo.jpeg")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.brand}>
              StayRent
            </Text>
          </View>

          <Text style={styles.eyebrow}>
            CHOOSE YOUR JOURNEY
          </Text>

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
            ]}
          >
            What brings you
            {"\n"}
            to StayRent?
          </Text>

          <Text
            style={[
              styles.subtitle,
              isSmallScreen && styles.subtitleSmall,
            ]}
          >
            Choose how you want to continue.
            You can search for a place or list
            your own property.
          </Text>
        </View>

        <View style={styles.cardsArea}>
          <Animated.View
            style={{
              transform: [
                {
                  scale: seekerScale,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.primaryCard,
                isSmallScreen && styles.cardSmall,
              ]}
              onPressIn={() =>
                animatePressIn(seekerScale)
              }
              onPressOut={() =>
                animatePressOut(seekerScale)
              }
              onPress={() =>
              router.replace(
  "/seeker-login"
)
              }
            >
              <View style={styles.primaryIconBox}>
                <Ionicons
                  name="search"
                  size={28}
                  color="#635BFF"
                />
              </View>

              <View style={styles.cardTextArea}>
                <Text style={styles.primaryCardLabel}>
                  FOR RENTERS
                </Text>

                <Text style={styles.primaryCardTitle}>
                  Find a place
                </Text>

                <Text style={styles.primaryCardText}>
                  Explore rooms, PGs and flats
                  near your preferred location.
                </Text>
              </View>

              <View style={styles.primaryArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                {
                  scale: ownerScale,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.secondaryCard,
                isSmallScreen && styles.cardSmall,
              ]}
              onPressIn={() =>
                animatePressIn(ownerScale)
              }
              onPressOut={() =>
                animatePressOut(ownerScale)
              }
              onPress={() =>
                router.push(
                  "/owner-login"
                )
              }
            >
              <View style={styles.secondaryIconBox}>
                <Ionicons
                  name="key-outline"
                  size={28}
                  color="#635BFF"
                />
              </View>

              <View style={styles.cardTextArea}>
                <Text style={styles.secondaryCardLabel}>
                  FOR OWNERS
                </Text>

                <Text style={styles.secondaryCardTitle}>
                  List a property
                </Text>

                <Text style={styles.secondaryCardText}>
                  Add your rental and connect
                  with people looking for a place.
                </Text>
              </View>

              <View style={styles.secondaryArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#635BFF"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.bottomInfo}>
          <View style={styles.trustChip}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#12B76A"
            />

            <Text style={styles.trustText}>
              Simple, secure and easy to use
            </Text>
          </View>

          <Text style={styles.footerText}>
            One platform. Two simple journeys.
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },

  glowOne: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    top: -110,
    right: -105,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 20,
    left: -130,
    backgroundColor: "#F4F2FF",
  },

  content: {
    width: "100%",
    flexGrow: 1,
    justifyContent: "space-between",
    alignSelf: "center",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#635BFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#635BFF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 13,
  },

  brand: {
    marginLeft: 11,
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.6,
  },

  eyebrow: {
    marginTop: 36,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#635BFF",
  },

  title: {
    marginTop: 11,
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#111827",
  },

  titleSmall: {
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -0.9,
  },

  subtitle: {
    marginTop: 14,
    maxWidth: 360,
    fontSize: 15,
    lineHeight: 23,
    color: "#667085",
  },

  subtitleSmall: {
    fontSize: 14,
    lineHeight: 21,
  },

  cardsArea: {
    gap: 16,
    marginTop: 26,
    width: "100%",
  },

  primaryCard: {
    minHeight: 178,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#635BFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#635BFF",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  primaryIconBox: {
    width: 58,
    height: 58,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryIconBox: {
    width: 58,
    height: 58,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: "#F1EFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTextArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
    paddingRight: 8,
  },

  primaryCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#DCD8FF",
  },

  primaryCardTitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  primaryCardText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#E8E6FF",
  },

  primaryArrow: {
    width: 40,
    flexShrink: 0,
    height: 40,
    borderRadius: 14,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardSmall: {
    minHeight: 156,
    padding: 16,
    borderRadius: 20,
  },

  secondaryCard: {
    minHeight: 178,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  secondaryCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#635BFF",
  },

  secondaryCardTitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },

  secondaryCardText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#667085",
  },

  secondaryArrow: {
    width: 40,
    flexShrink: 0,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F1EFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomInfo: {
    alignItems: "center",
    marginTop: 22,
  },

  trustChip: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  trustText: {
    flexShrink: 1,
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
  },

  footerText: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: "600",
    color: "#98A2B3",
  },
});