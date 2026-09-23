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
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
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

const PRIVACY_POLICY_URL =
  "https://stayrent.in/privacy-policy";

const TERMS_OF_USE_URL =
  "https://stayrent.in/terms-of-use";

const ACCOUNT_DELETION_URL =
  "https://stayrent.in/account-deletion";

const CONTACT_URL =
  "https://stayrent.in/contact";

type AuthUser = {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  profilePhoto?: string;
};

export default function SeekerProfileScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallScreen =
    width < 380 || height < 700;

  const horizontalPadding =
    width < 360
      ? 14
      : width < 430
        ? 18
        : 20;

  const contentMaxWidth = 720;

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [city, setCity] =
    useState("");

  const loadUser = async () => {
    try {
      const savedUser =
        await getAuthUser();

      setUser(savedUser);

      setName(
        savedUser?.name ||
          savedUser?.fullName ||
          ""
      );

      setPhone(
        savedUser?.phone || ""
      );

      setCity(
        savedUser?.city || ""
      );
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

      const asset =
        pickerResult.assets[0];

      if (!asset?.uri) {
        Alert.alert(
          "Photo Error",
          "Unable to read the selected photo."
        );

        return;
      }

      const token =
        await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );

        return;
      }

      setUploadingPhoto(true);

      const imageFile =
        new File(asset.uri);

      const formData =
        new FormData();

      formData.append(
        "image",
        imageFile
      );

      const uploadResponse =
        await fetch(
          `${API_BASE_URL}/uploads/profile-photo`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
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

      const saveResponse =
        await fetch(
          `${API_BASE_URL}/auth/profile-photo`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              profilePhoto:
                uploadData.image,
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

      await saveAuthUser(
        saveData.user
      );

      setUser(
        saveData.user
      );

      setName(
        saveData.user?.name || ""
      );

      setPhone(
        saveData.user?.phone || ""
      );

      setCity(
        saveData.user?.city || ""
      );

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

  const handleEditProfile = () => {
    setName(
      user?.name ||
        user?.fullName ||
        ""
    );

    setPhone(
      user?.phone || ""
    );

    setCity(
      user?.city || ""
    );

    setEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setName(
      user?.name ||
        user?.fullName ||
        ""
    );

    setPhone(
      user?.phone || ""
    );

    setCity(
      user?.city || ""
    );

    setEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    try {
      const cleanName =
        name.trim();

      const cleanPhone =
        phone.trim();

      const cleanCity =
        city.trim();

      if (
        !cleanName ||
        !cleanPhone ||
        !cleanCity
      ) {
        Alert.alert(
          "Required fields",
          "Please enter your name, phone number and city."
        );

        return;
      }

      const token =
        await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );

        return;
      }

      setSavingProfile(true);

      const response =
        await fetch(
          `${API_BASE_URL}/auth/profile`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: cleanName,
              phone: cleanPhone,
              city: cleanCity,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.user
      ) {
        Alert.alert(
          "Update failed",
          data?.message ||
            "Unable to update profile."
        );

        return;
      }

      await saveAuthUser(
        data.user
      );

      setUser(
        data.user
      );

      setName(
        data.user?.name || ""
      );

      setPhone(
        data.user?.phone || ""
      );

      setCity(
        data.user?.city || ""
      );

      setEditingProfile(false);

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Seeker profile update error:",
        error
      );

      Alert.alert(
        "Update Error",
        "Unable to update profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
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
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.glowOne}
      />

      <View
        style={styles.glowTwo}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal:
              horizontalPadding,

            paddingTop:
              isSmallScreen
                ? 18
                : 26,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.pageContent,
            {
              maxWidth:
                contentMaxWidth,
            },
          ]}
        >
          {/* HEADER */}

          <View
            style={styles.header}
          >
            <View
              style={styles.brandWrap}
            >
              <View
                style={styles.brandLogo}
              >
                <Ionicons
                  name="home"
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View>
                <Text
                  style={styles.brand}
                >
                  StayRent
                </Text>

                <Text
                  style={
                    styles.brandCaption
                  }
                >
                  Your profile
                </Text>
              </View>
            </View>

            <View
              style={
                styles.profileIconBox
              }
            >
              <Ionicons
                name="person"
                size={21}
                color="#635BFF"
              />
            </View>
          </View>

          {/* PROFILE CARD */}

          <View
            style={[
              styles.profileCard,
              isSmallScreen &&
                styles.profileCardSmall,
            ]}
          >
            <TouchableOpacity
              style={
                styles.avatarButton
              }
              activeOpacity={0.85}
              disabled={
                uploadingPhoto
              }
              onPress={
                handleProfilePhoto
              }
            >
              <View
                style={styles.avatar}
              >
                {user?.profilePhoto ? (
                  <Image
                    source={{
                      uri: user.profilePhoto,
                    }}
                    style={
                      styles.avatarImage
                    }
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
                  <View
                    style={
                      styles.avatarLoadingOverlay
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  </View>
                ) : null}
              </View>

              <View
                style={
                  styles.cameraBadge
                }
              >
                <Ionicons
                  name="camera"
                  size={15}
                  color="#635BFF"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={
                uploadingPhoto
              }
              onPress={
                handleProfilePhoto
              }
            >
              <Text
                style={
                  styles.changePhotoText
                }
              >
                {user?.profilePhoto
                  ? "Change photo"
                  : "Add profile photo"}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.name,
                isSmallScreen &&
                  styles.nameSmall,
              ]}
            >
              {displayName}
            </Text>

            <View
              style={styles.roleBadge}
            >
              <Ionicons
                name="search-outline"
                size={14}
                color="#635BFF"
              />

              <Text
                style={
                  styles.roleText
                }
              >
                Property Seeker
              </Text>
            </View>
          </View>

          {/* ACCOUNT DETAILS */}

          <View
            style={
              styles.sectionHeaderRow
            }
          >
            <View>
              <Text
                style={styles.eyebrow}
              >
                ACCOUNT
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Personal details
              </Text>
            </View>

            {!editingProfile ? (
              <TouchableOpacity
                style={
                  styles.editButton
                }
                activeOpacity={0.8}
                onPress={
                  handleEditProfile
                }
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color="#635BFF"
                />

                <Text
                  style={
                    styles.editButtonText
                  }
                >
                  Edit
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {editingProfile ? (
            <View
              style={[
                styles.editCard,
                isSmallScreen &&
                  styles.cardSmall,
              ]}
            >
              <Text
                style={
                  styles.inputLabel
                }
              >
                Full name
              </Text>

              <View
                style={
                  styles.inputBox
                }
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color="#635BFF"
                />

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={
                    setName
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor="#98A2B3"
                  autoCapitalize="words"
                />
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  styles.inputLabelSpacing,
                ]}
              >
                Phone number
              </Text>

              <View
                style={
                  styles.inputBox
                }
              >
                <Ionicons
                  name="call-outline"
                  size={19}
                  color="#12B76A"
                />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={
                    setPhone
                  }
                  placeholder="Enter phone number"
                  placeholderTextColor="#98A2B3"
                  keyboardType="phone-pad"
                />
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  styles.inputLabelSpacing,
                ]}
              >
                City
              </Text>

              <View
                style={
                  styles.inputBox
                }
              >
                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#F79009"
                />

                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={
                    setCity
                  }
                  placeholder="Enter your city"
                  placeholderTextColor="#98A2B3"
                  autoCapitalize="words"
                />
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  styles.inputLabelSpacing,
                ]}
              >
                Email address
              </Text>

              <View
                style={[
                  styles.inputBox,
                  styles.disabledInputBox,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color="#98A2B3"
                />

                <Text
                  style={
                    styles.disabledInputText
                  }
                  numberOfLines={1}
                >
                  {user?.email ||
                    "Not available"}
                </Text>

                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color="#98A2B3"
                />
              </View>

              <Text
                style={
                  styles.emailHint
                }
              >
                Email address cannot
                be changed here.
              </Text>

              <View
                style={
                  styles.editActions
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  activeOpacity={0.8}
                  disabled={
                    savingProfile
                  }
                  onPress={
                    handleCancelEdit
                  }
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    savingProfile &&
                      styles.saveButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={
                    savingProfile
                  }
                  onPress={
                    handleSaveProfile
                  }
                >
                  {savingProfile ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-outline"
                        size={19}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.saveButtonText
                        }
                      >
                        Save changes
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.detailsCard,
                isSmallScreen &&
                  styles.cardSmall,
              ]}
            >
              <View
                style={
                  styles.detailRow
                }
              >
                <View
                  style={
                    styles.detailIcon
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color="#635BFF"
                  />
                </View>

                <View
                  style={
                    styles.detailTextWrap
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Name
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {displayName}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.detailRow
                }
              >
                <View
                  style={
                    styles.detailIcon
                  }
                >
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color="#635BFF"
                  />
                </View>

                <View
                  style={
                    styles.detailTextWrap
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Email
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                    numberOfLines={1}
                  >
                    {user?.email ||
                      "Not available"}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.detailRow
                }
              >
                <View
                  style={
                    styles.detailIcon
                  }
                >
                  <Ionicons
                    name="call-outline"
                    size={19}
                    color="#635BFF"
                  />
                </View>

                <View
                  style={
                    styles.detailTextWrap
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Phone
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {user?.phone ||
                      "Not available"}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.detailRow
                }
              >
                <View
                  style={
                    styles.detailIcon
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={19}
                    color="#F79009"
                  />
                </View>

                <View
                  style={
                    styles.detailTextWrap
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    City
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {user?.city ||
                      "Not added"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* SEEKER TOOLS */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={styles.eyebrow}
            >
              SEEKER TOOLS
            </Text>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Quick access
            </Text>
          </View>

          <View
            style={[
              styles.toolsCard,
              isSmallScreen &&
                styles.cardSmall,
            ]}
          >
            <TouchableOpacity
              style={
                styles.toolRow
              }
              activeOpacity={0.85}
              onPress={() =>
                router.replace(
                  "/seeker-favorites" as any
                )
              }
            >
              <View
                style={
                  styles.favoriteIconBox
                }
              >
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#F04438"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Saved Properties
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
                  View your favorite rentals
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#98A2B3"
              />
            </TouchableOpacity>

            <View
              style={
                styles.divider
              }
            />

            <TouchableOpacity
              style={
                styles.toolRow
              }
              activeOpacity={0.85}
              onPress={() =>
                router.replace(
                  "/seeker-map" as any
                )
              }
            >
              <View
                style={
                  styles.mapIconBox
                }
              >
                <Ionicons
                  name="map-outline"
                  size={20}
                  color="#635BFF"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Explore Map
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
                  See rentals around your location
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color="#98A2B3"
              />
            </TouchableOpacity>

            <View
              style={
                styles.divider
              }
            />

            <TouchableOpacity
              style={
                styles.toolRow
              }
              activeOpacity={0.85}
              onPress={() =>
                router.push(
                  "/seeker-support" as any
                )
              }
            >
              <View
                style={
                  styles.supportIconBox
                }
              >
                <Ionicons
                  name="help-circle-outline"
                  size={21}
                  color="#F79009"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Help & Support
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
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

          {/* LEGAL & SUPPORT */}

          <View
            style={[
              styles.sectionHeader,
              styles.sectionHeaderSpacing,
            ]}
          >
            <Text
              style={styles.eyebrow}
            >
              LEGAL & SUPPORT
            </Text>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Policies and account help
            </Text>
          </View>

          <View
            style={[
              styles.toolsCard,
              isSmallScreen &&
                styles.cardSmall,
            ]}
          >
            <TouchableOpacity
              style={styles.toolRow}
              activeOpacity={0.85}
              onPress={() =>
                Linking.openURL(
                  PRIVACY_POLICY_URL
                )
              }
            >
              <View
                style={
                  styles.privacyIconBox
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color="#635BFF"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Privacy Policy
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
                  See how StayRent handles your information
                </Text>
              </View>

              <Ionicons
                name="open-outline"
                size={18}
                color="#98A2B3"
              />
            </TouchableOpacity>

            <View
              style={styles.divider}
            />

            <TouchableOpacity
              style={styles.toolRow}
              activeOpacity={0.85}
              onPress={() =>
                Linking.openURL(
                  TERMS_OF_USE_URL
                )
              }
            >
              <View
                style={
                  styles.termsIconBox
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={21}
                  color="#1570EF"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Terms of Use
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
                  Read the rules for using StayRent
                </Text>
              </View>

              <Ionicons
                name="open-outline"
                size={18}
                color="#98A2B3"
              />
            </TouchableOpacity>

            <View
              style={styles.divider}
            />

            <TouchableOpacity
              style={styles.toolRow}
              activeOpacity={0.85}
              onPress={() =>
                Linking.openURL(
                  ACCOUNT_DELETION_URL
                )
              }
            >
              <View
                style={
                  styles.deleteAccountIconBox
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color="#F04438"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Account Deletion
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
                  Learn how to request account deletion
                </Text>
              </View>

              <Ionicons
                name="open-outline"
                size={18}
                color="#98A2B3"
              />
            </TouchableOpacity>

            <View
              style={styles.divider}
            />

            <TouchableOpacity
              style={styles.toolRow}
              activeOpacity={0.85}
              onPress={() =>
                Linking.openURL(
                  CONTACT_URL
                )
              }
            >
              <View
                style={
                  styles.contactIconBox
                }
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={21}
                  color="#F79009"
                />
              </View>

              <View
                style={
                  styles.toolTextWrap
                }
              >
                <Text
                  style={
                    styles.toolTitle
                  }
                >
                  Contact StayRent
                </Text>

                <Text
                  style={
                    styles.toolText
                  }
                >
                  Open StayRent contact information
                </Text>
              </View>

              <Ionicons
                name="open-outline"
                size={18}
                color="#98A2B3"
              />
            </TouchableOpacity>
          </View>

          {/* LOGOUT */}

          <TouchableOpacity
            style={
              styles.logoutButton
            }
            activeOpacity={0.9}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#F04438"
            />

            <Text
              style={
                styles.logoutText
              }
            >
              Logout
            </Text>
          </TouchableOpacity>
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

  header: {
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

  profileCardSmall: {
    padding: 20,
    borderRadius: 22,
    marginBottom: 24,
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

  nameSmall: {
    fontSize: 20,
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

  sectionHeaderSpacing: {
    marginTop: 28,
  },

  sectionHeaderRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
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

  editButton: {
    height: 36,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 12,
    backgroundColor: "#F1EFFF",
  },

  editButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#635BFF",
  },

  detailsCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    marginBottom: 28,
  },

  editCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    marginBottom: 28,
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 10,
    fontWeight: "800",
    color: "#475467",
  },

  inputLabelSpacing: {
    marginTop: 16,
  },

  inputBox: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 15,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  disabledInputBox: {
    backgroundColor: "#F2F4F7",
  },

  disabledInputText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
  },

  emailHint: {
    marginTop: 7,
    fontSize: 9,
    color: "#98A2B3",
  },

  editActions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#F2F4F7",
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475467",
  },

  saveButton: {
    flex: 1.45,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 15,
    backgroundColor: "#635BFF",
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
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
    minWidth: 0,
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
    flexShrink: 1,
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

  privacyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  termsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF8FF",
  },

  deleteAccountIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  contactIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFAEB",
  },

  toolTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  toolTitle: {
    fontSize: 13,
    flexShrink: 1,
    fontWeight: "800",
    color: "#111827",
  },

  toolText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    flexShrink: 1,
    color: "#98A2B3",
  },

  cardSmall: {
    padding: 14,
    borderRadius: 18,
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