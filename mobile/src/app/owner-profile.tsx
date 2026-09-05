import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import OwnerBottomNav from "../components/OwnerBottomNav";
import {
  clearAuthSession,
  getAuthUser,
} from "../utils/authStorage";

type OwnerUser = {
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function OwnerProfileScreen() {
  const router = useRouter();

  const [user, setUser] =
    useState<OwnerUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);

      const savedUser =
        await getAuthUser();

      setUser(savedUser);
    } catch (error) {
      console.error(
        "Owner profile load error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from StayRent?",
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

              router.replace(
                "/owner-login" as any
              );
            } catch (error) {
              console.error(
                "Owner logout error:",
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

  const displayName =
    user?.name ||
    user?.fullName ||
    "Property Owner";

  const firstLetter =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() || "O";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>
              ACCOUNT
            </Text>

            <Text style={styles.headerTitle}>
              Your Profile
            </Text>
          </View>

          <View style={styles.brandLogo}>
            <Ionicons
              name="home"
              size={18}
              color="#FFFFFF"
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="small"
              color="#635BFF"
            />

            <Text style={styles.loadingText}>
              Loading your profile...
            </Text>
          </View>
        ) : (
          <>
            {/* PROFILE HERO */}

            <View style={styles.profileHero}>
              <View style={styles.heroGlow} />

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {firstLetter}
                </Text>
              </View>

              <Text style={styles.ownerName}>
                {displayName}
              </Text>

              <View style={styles.roleBadge}>
                <Ionicons
                  name="business-outline"
                  size={14}
                  color="#D9D6FE"
                />

                <Text style={styles.roleText}>
                  PROPERTY OWNER
                </Text>
              </View>

              <Text style={styles.heroSubtitle}>
                Manage your StayRent account and rental portfolio.
              </Text>
            </View>

            {/* ACCOUNT DETAILS */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>
                PERSONAL DETAILS
              </Text>

              <Text style={styles.sectionTitle}>
                Account information
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIcon,
                    styles.nameIcon,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#635BFF"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Full name
                  </Text>

                  <Text style={styles.detailValue}>
                    {displayName}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIcon,
                    styles.emailIcon,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#1570EF"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Email address
                  </Text>

                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                  >
                    {user?.email ||
                      "Not available"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View
                  style={[
                    styles.detailIcon,
                    styles.phoneIcon,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#12B76A"
                  />
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    Phone number
                  </Text>

                  <Text style={styles.detailValue}>
                    {user?.phone ||
                      "Not available"}
                  </Text>
                </View>
              </View>
            </View>

            {/* PROPERTY ACTIONS */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>
                OWNER TOOLS
              </Text>

              <Text style={styles.sectionTitle}>
                Manage your rentals
              </Text>
            </View>

            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(
                    "/owner-properties"
                  )
                }
              >
                <View
                  style={[
                    styles.actionIcon,
                    styles.listingIcon,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={21}
                    color="#635BFF"
                  />
                </View>

                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    My Properties
                  </Text>

                  <Text style={styles.actionText}>
                    View and manage all listings
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#98A2B3"
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(
                    "/owner-add-property"
                  )
                }
              >
                <View
                  style={[
                    styles.actionIcon,
                    styles.addIcon,
                  ]}
                >
                  <Ionicons
                    name="add-outline"
                    size={22}
                    color="#12B76A"
                  />
                </View>

                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    Add Property
                  </Text>

                  <Text style={styles.actionText}>
                    Publish a new rental listing
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#98A2B3"
                />
              </TouchableOpacity>
            </View>

            {/* SESSION */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>
                SECURITY
              </Text>

              <Text style={styles.sectionTitle}>
                Session
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.85}
              onPress={handleLogout}
            >
              <View style={styles.logoutIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={21}
                  color="#F04438"
                />
              </View>

              <View style={styles.logoutContent}>
                <Text style={styles.logoutTitle}>
                  Logout
                </Text>

                <Text style={styles.logoutText}>
                  Sign out from your owner account
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#F04438"
              />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <OwnerBottomNav />
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
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -135,
    right: -120,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 50,
    left: -155,
    backgroundColor: "#F5F3FF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 27,
    paddingBottom: 125,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 21,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#635BFF",
  },

  headerTitle: {
    marginTop: 4,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: "#111827",
  },

  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  loadingCard: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "#98A2B3",
  },

  profileHero: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: "#111827",
  },

  heroGlow: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    top: -85,
    right: -75,
    backgroundColor: "#312E81",
    opacity: 0.75,
  },

  avatar: {
    width: 74,
    height: 74,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
    borderWidth: 4,
    borderColor:
      "rgba(255,255,255,0.15)",
  },

  avatarText: {
    fontSize: 29,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  ownerName: {
    marginTop: 15,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#FFFFFF",
  },

  roleBadge: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  roleText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#E9E7FF",
  },

  heroSubtitle: {
    marginTop: 12,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#C7CDD8",
  },

  sectionHeader: {
    marginTop: 29,
    marginBottom: 12,
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  sectionTitle: {
    marginTop: 4,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#111827",
  },

  detailsCard: {
    paddingHorizontal: 17,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  detailRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  nameIcon: {
    backgroundColor: "#F1EFFF",
  },

  emailIcon: {
    backgroundColor: "#EFF8FF",
  },

  phoneIcon: {
    backgroundColor: "#ECFDF3",
  },

  detailContent: {
    flex: 1,
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#98A2B3",
  },

  detailValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F1F4",
  },

  actionsCard: {
    paddingHorizontal: 17,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  actionRow: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  listingIcon: {
    backgroundColor: "#F1EFFF",
  },

  addIcon: {
    backgroundColor: "#ECFDF3",
  },

  actionContent: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  actionText: {
    marginTop: 4,
    fontSize: 9,
    color: "#98A2B3",
  },

  logoutButton: {
    minHeight: 78,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 23,
    backgroundColor: "#FFF8F7",
    borderWidth: 1,
    borderColor: "#FECDCA",
  },

  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  logoutContent: {
    flex: 1,
    marginLeft: 12,
  },

  logoutTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#B42318",
  },

  logoutText: {
    marginTop: 4,
    fontSize: 9,
    color: "#F04438",
  },
});