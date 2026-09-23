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

import OwnerBottomNav from "../components/OwnerBottomNav";
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

type OwnerUser = {
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

export default function OwnerProfileScreen() {
  const router = useRouter();

  const { width, height } =
    useWindowDimensions();

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
    useState<OwnerUser | null>(null);

  const [loading, setLoading] =
    useState(true);

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
      setLoading(true);

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
        "Owner profile photo error:",
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
        "Owner profile update error:",
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
                ? 20
                : 27,
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
            style={[
              styles.header,
              isSmallScreen &&
                styles.headerSmall,
            ]}
          >
            <View>
              <Text
                style={
                  styles.headerEyebrow
                }
              >
                ACCOUNT
              </Text>

              <Text
                style={[
                  styles.headerTitle,
                  isSmallScreen &&
                    styles.headerTitleSmall,
                ]}
              >
                Your Profile
              </Text>
            </View>

            <View
              style={styles.brandLogo}
            >
              <Ionicons
                name="home"
                size={18}
                color="#FFFFFF"
              />
            </View>
          </View>

          {loading ? (
            <View
              style={
                styles.loadingCard
              }
            >
              <ActivityIndicator
                size="small"
                color="#635BFF"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading your
                profile...
              </Text>
            </View>
          ) : (
            <>
              {/* PROFILE HERO */}

              <View
                style={[
                  styles.profileHero,
                  isSmallScreen &&
                    styles.profileHeroSmall,
                ]}
              >
                <View
                  style={
                    styles.heroGlow
                  }
                />

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
                    style={
                      styles.avatar
                    }
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
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {firstLetter}
                      </Text>
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
                  style={
                    styles.ownerName
                  }
                >
                  {displayName}
                </Text>

                <View
                  style={
                    styles.roleBadge
                  }
                >
                  <Ionicons
                    name="business-outline"
                    size={14}
                    color="#D9D6FE"
                  />

                  <Text
                    style={
                      styles.roleText
                    }
                  >
                    PROPERTY OWNER
                  </Text>
                </View>

                <Text
                  style={
                    styles.heroSubtitle
                  }
                >
                  Manage your
                  StayRent account and
                  rental portfolio.
                </Text>
              </View>

              {/* ACCOUNT DETAILS */}

              <View
                style={
                  styles.sectionHeaderRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    PERSONAL DETAILS
                  </Text>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Account information
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
                      style={
                        styles.input
                      }
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
                      style={
                        styles.input
                      }
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
                      style={
                        styles.input
                      }
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

                    <View
                      style={
                        styles.detailContent
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        Full name
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

                    <View
                      style={
                        styles.detailContent
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        Email address
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                        numberOfLines={
                          1
                        }
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

                    <View
                      style={
                        styles.detailContent
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        Phone number
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
                      style={[
                        styles.detailIcon,
                        styles.cityIcon,
                      ]}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#F79009"
                      />
                    </View>

                    <View
                      style={
                        styles.detailContent
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

              {/* PROPERTY ACTIONS */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionEyebrow
                  }
                >
                  OWNER TOOLS
                </Text>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Manage your rentals
                </Text>
              </View>

              <View
                style={[
                  styles.actionsCard,
                  isSmallScreen &&
                    styles.cardSmall,
                ]}
              >
                <TouchableOpacity
                  style={
                    styles.actionRow
                  }
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

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      My Properties
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      View and manage all
                      listings
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
                    styles.actionRow
                  }
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

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      Add Property
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      Publish a new rental
                      listing
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
                    styles.actionRow
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(
                      "/owner-support" as any
                    )
                  }
                >
                  <View
                    style={[
                      styles.actionIcon,
                      styles.supportIcon,
                    ]}
                  >
                    <Ionicons
                      name="help-circle-outline"
                      size={22}
                      color="#F79009"
                    />
                  </View>

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      Help & Support
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      Report a problem or
                      contact StayRent
                      support
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
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionEyebrow
                  }
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
                  styles.actionsCard,
                  isSmallScreen &&
                    styles.cardSmall,
                ]}
              >
                <TouchableOpacity
                  style={
                    styles.actionRow
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    Linking.openURL(
                      PRIVACY_POLICY_URL
                    )
                  }
                >
                  <View
                    style={[
                      styles.actionIcon,
                      styles.privacyIcon,
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={22}
                      color="#635BFF"
                    />
                  </View>

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      Privacy Policy
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      See how StayRent
                      handles your
                      information
                    </Text>
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={18}
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
                    styles.actionRow
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    Linking.openURL(
                      TERMS_OF_USE_URL
                    )
                  }
                >
                  <View
                    style={[
                      styles.actionIcon,
                      styles.termsIcon,
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color="#1570EF"
                    />
                  </View>

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      Terms of Use
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      Read the rules for
                      using StayRent
                    </Text>
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={18}
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
                    styles.actionRow
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    Linking.openURL(
                      ACCOUNT_DELETION_URL
                    )
                  }
                >
                  <View
                    style={[
                      styles.actionIcon,
                      styles.deleteAccountIcon,
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color="#F04438"
                    />
                  </View>

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      Account Deletion
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      Learn how to request
                      account deletion
                    </Text>
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={18}
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
                    styles.actionRow
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    Linking.openURL(
                      CONTACT_URL
                    )
                  }
                >
                  <View
                    style={[
                      styles.actionIcon,
                      styles.contactIcon,
                    ]}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={22}
                      color="#F79009"
                    />
                  </View>

                  <View
                    style={
                      styles.actionContent
                    }
                  >
                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                      Contact StayRent
                    </Text>

                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      Open StayRent contact
                      information
                    </Text>
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={18}
                    color="#98A2B3"
                  />
                </TouchableOpacity>
              </View>

              {/* SESSION */}

              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionEyebrow
                  }
                >
                  SECURITY
                </Text>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Session
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  isSmallScreen &&
                    styles.logoutButtonSmall,
                ]}
                activeOpacity={0.85}
                onPress={handleLogout}
              >
                <View
                  style={
                    styles.logoutIcon
                  }
                >
                  <Ionicons
                    name="log-out-outline"
                    size={21}
                    color="#F04438"
                  />
                </View>

                <View
                  style={
                    styles.logoutContent
                  }
                >
                  <Text
                    style={
                      styles.logoutTitle
                    }
                  >
                    Logout
                  </Text>

                  <Text
                    style={
                      styles.logoutText
                    }
                  >
                    Sign out from your
                    owner account
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
        </View>
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
    marginBottom: 21,
    gap: 12,
  },

  headerSmall: {
    alignItems: "flex-start",
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

  headerTitleSmall: {
    fontSize: 22,
    letterSpacing: -0.5,
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

  profileHeroSmall: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 24,
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
    backgroundColor: "#635BFF",
    borderWidth: 4,
    borderColor:
      "rgba(255,255,255,0.15)",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarLoadingOverlay: {
   
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

  avatarText: {
    fontSize: 29,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  ownerName: {
    marginTop: 15,
    maxWidth: "100%",
    textAlign: "center",
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

  sectionHeaderRow: {
    marginTop: 29,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
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

  editCard: {
    padding: 17,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  cardSmall: {
    paddingHorizontal: 13,
    borderRadius: 20,
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

  cityIcon: {
    backgroundColor: "#FFFAEB",
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#98A2B3",
  },

  detailValue: {
    marginTop: 4,
    flexShrink: 1,
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

  supportIcon: {
    backgroundColor: "#FFFAEB",
  },

  privacyIcon: {
    backgroundColor: "#F1EFFF",
  },

  termsIcon: {
    backgroundColor: "#EFF8FF",
  },

  deleteAccountIcon: {
    backgroundColor: "#FFF1F0",
  },

  contactIcon: {
    backgroundColor: "#FFFAEB",
  },

  actionContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  actionText: {
    marginTop: 4,
    flexShrink: 1,
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
    minWidth: 0,
    marginLeft: 12,
  },

  logoutButtonSmall: {
    minHeight: 72,
    paddingHorizontal: 13,
    borderRadius: 20,
  },

  logoutTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#B42318",
  },

  logoutText: {
    marginTop: 4,
    flexShrink: 1,
    fontSize: 9,
    color: "#F04438",
  },
});