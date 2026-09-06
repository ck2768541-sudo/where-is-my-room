import { Ionicons } from "@expo/vector-icons";
import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SeekerBottomNav from "../components/SeekerBottomNav";
import { API_BASE_URL } from "../config/api";
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  saveAuthUser,
} from "../utils/authStorage";

type AuthUser = {
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  profilePhoto?: string;
};

export default function SeekerProfileScreen() {
  const router = useRouter();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const loadUser = async () => {
    try {
      const savedUser = await getAuthUser();

      setUser(savedUser);
    } catch (error) {
      console.error(
        "Load seeker profile error:",
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const handleProfilePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to choose a profile picture."
        );
        return;
      }

      const pickerResult =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (pickerResult.canceled) {
        return;
      }

      const asset = pickerResult.assets[0];

      if (!asset?.uri) {
        Alert.alert(
          "Photo Error",
          "Unable to read the selected photo."
        );
        return;
      }

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );
        return;
      }

      setUploadingPhoto(true);

      const imageFile = new File(asset.uri);

      const formData = new FormData();

      formData.append(
        "image",
        imageFile
      );

      const uploadResponse = await fetch(
        `${API_BASE_URL}/uploads/profile-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const uploadData =
        await uploadResponse.json();

      if (
        !uploadResponse.ok ||
        !uploadData?.image
      ) {
        Alert.alert(
          "Upload failed",
          uploadData?.message ||
            "Unable to upload profile photo."
        );
        return;
      }

      const saveResponse = await fetch(
        `${API_BASE_URL}/auth/profile-photo`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profilePhoto: uploadData.image,
          }),
        }
      );

      const saveData =
        await saveResponse.json();

      if (
        !saveResponse.ok ||
        !saveData?.user
      ) {
        Alert.alert(
          "Save failed",
          saveData?.message ||
            "Photo uploaded, but profile could not be updated."
        );
        return;
      }

      await saveAuthUser(saveData.user);
      setUser(saveData.user);

      Alert.alert(
        "Profile Updated",
        "Your profile photo has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Seeker profile photo error:",
        error
      );

      Alert.alert(
        "Upload Error",
        "Unable to update profile photo. Please try again."
      );
    } finally {
      setUploadingPhoto(false);
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

  const displayName =
    user?.name ||
    user?.fullName ||
    "Seeker";

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
          <View style={styles.brandWrap}>
            <View style={styles.brandLogo}>
              <Ionicons
                name="home"
                size={18}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.brand}>
                StayRent
              </Text>

              <Text style={styles.brandCaption}>
                Your profile
              </Text>
            </View>
          </View>

          <View style={styles.profileIconBox}>
            <Ionicons
              name="person"
              size={21}
              color="#635BFF"
            />
          </View>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.85}
            disabled={uploadingPhoto}
            onPress={handleProfilePhoto}
          >
            <View style={styles.avatar}>
              {user?.profilePhoto ? (
                <Image
                  source={{
                    uri: user.profilePhoto,
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={34}
                  color="#635BFF"
                />
              )}

              {uploadingPhoto ? (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.cameraBadge}>
              <Ionicons
                name="camera"
                size={15}
                color="#635BFF"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={uploadingPhoto}
            onPress={handleProfilePhoto}
          >
            <Text style={styles.changePhotoText}>
              {user?.profilePhoto
                ? "Change photo"
                : "Add profile photo"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.name}>
            {displayName}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="search-outline"
              size={14}
              color="#635BFF"
            />

            <Text style={styles.roleText}>
              Property Seeker
            </Text>
          </View>
        </View>

        {/* ACCOUNT DETAILS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.eyebrow}>
            ACCOUNT
          </Text>

          <Text style={styles.sectionTitle}>
            Personal details
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#635BFF"
              />
            </View>

            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>
                Name
              </Text>

              <Text style={styles.detailValue}>
                {displayName}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="mail-outline"
                size={19}
                color="#635BFF"
              />
            </View>

            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>
                Email
              </Text>

              <Text
                style={styles.detailValue}
                numberOfLines={1}
              >
                {user?.email || "Not available"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="call-outline"
                size={19}
                color="#635BFF"
              />
            </View>

            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>
                Phone
              </Text>

              <Text style={styles.detailValue}>
                {user?.phone || "Not available"}
              </Text>
            </View>
          </View>
        </View>

        {/* SEEKER TOOLS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.eyebrow}>
            SEEKER TOOLS
          </Text>

          <Text style={styles.sectionTitle}>
            Quick access
          </Text>
        </View>

        <View style={styles.toolsCard}>
          <TouchableOpacity
            style={styles.toolRow}
            activeOpacity={0.85}
            onPress={() =>
              router.replace(
                "/seeker-favorites" as any
              )
            }
          >
            <View style={styles.favoriteIconBox}>
              <Ionicons
                name="heart-outline"
                size={20}
                color="#F04438"
              />
            </View>

            <View style={styles.toolTextWrap}>
              <Text style={styles.toolTitle}>
                Saved Properties
              </Text>

              <Text style={styles.toolText}>
                View your favorite rentals
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
            style={styles.toolRow}
            activeOpacity={0.85}
            onPress={() =>
              router.replace(
                "/seeker-map" as any
              )
            }
          >
            <View style={styles.mapIconBox}>
              <Ionicons
                name="map-outline"
                size={20}
                color="#635BFF"
              />
            </View>

            <View style={styles.toolTextWrap}>
              <Text style={styles.toolTitle}>
                Explore Map
              </Text>

              <Text style={styles.toolText}>
                See rentals around your location
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
            style={styles.toolRow}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                "/seeker-support" as any
              )
            }
          >
            <View style={styles.supportIconBox}>
              <Ionicons
                name="help-circle-outline"
                size={21}
                color="#F79009"
              />
            </View>

            <View style={styles.toolTextWrap}>
              <Text style={styles.toolTitle}>
                Help & Support
              </Text>

              <Text style={styles.toolText}>
                Contact StayRent support or report a problem
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#98A2B3"
            />
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.9}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#F04438"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
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

  glowOne: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -130,
    right: -120,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -150,
    bottom: 30,
    backgroundColor: "#F5F3FF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 125,
  },

  header: {
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
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

  profileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 26,
    backgroundColor: "#111827",
    marginBottom: 28,
  },

  avatarButton: {
    position: "relative",
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(17,24,39,0.55)",
  },

  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#111827",
  },

  changePhotoText: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "800",
    color: "#D9D6FE",
  },

  name: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  roleBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F1EFFF",
  },

  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#635BFF",
  },

  sectionHeader: {
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
    color: "#635BFF",
  },

  sectionTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#111827",
  },

  detailsCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    marginBottom: 28,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  detailTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#98A2B3",
  },

  detailValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F0F1F4",
  },

  toolsCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  toolRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  favoriteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  mapIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  supportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFAEB",
  },

  toolTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  toolTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  toolText: {
    marginTop: 3,
    fontSize: 10,
    color: "#98A2B3",
  },

  logoutButton: {
    height: 56,
    marginTop: 22,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF5F4",
    borderWidth: 1,
    borderColor: "#FEE4E2",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F04438",
  },
});
