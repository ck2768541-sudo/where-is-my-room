import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "../utils/authStorage";

type PropertyType = "room" | "pg" | "flat" | "hotel";
type AvailableFor = "anyone" | "male" | "female" | "family";
type Furnishing =
  | "furnished"
  | "semi-furnished"
  | "unfurnished";

export default function OwnerAddPropertyScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [propertyType, setPropertyType] =
    useState<PropertyType>("room");

  const [monthlyRent, setMonthlyRent] = useState("");

  const [securityDeposit, setSecurityDeposit] =
    useState("");

  const [availableFor, setAvailableFor] =
    useState<AvailableFor>("anyone");

  const [furnishing, setFurnishing] =
    useState<Furnishing>("unfurnished");

  const [acAvailable, setAcAvailable] = useState(true);
  const [acPricePerDay, setAcPricePerDay] = useState("");
  const [nonAcAvailable, setNonAcAvailable] = useState(true);
  const [nonAcPricePerDay, setNonAcPricePerDay] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");

  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const propertyTypes = [
    {
      label: "Room",
      value: "room" as PropertyType,
    },
    {
      label: "PG",
      value: "pg" as PropertyType,
    },
    {
      label: "Flat",
      value: "flat" as PropertyType,
    },
    {
      label: "Hotel",
      value: "hotel" as PropertyType,
    },
  ];

  const availableOptions = [
    {
      label: "Anyone",
      value: "anyone" as AvailableFor,
    },
    {
      label: "Male",
      value: "male" as AvailableFor,
    },
    {
      label: "Female",
      value: "female" as AvailableFor,
    },
    {
      label: "Family",
      value: "family" as AvailableFor,
    },
  ];

  const furnishingOptions = [
    {
      label: "Furnished",
      value: "furnished" as Furnishing,
    },
    {
      label: "Semi Furnished",
      value: "semi-furnished" as Furnishing,
    },
    {
      label: "Unfurnished",
      value: "unfurnished" as Furnishing,
    },
  ];

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPropertyType("room");
    setMonthlyRent("");
    setSecurityDeposit("");
    setAvailableFor("anyone");
    setFurnishing("unfurnished");
    setAcAvailable(true);
    setAcPricePerDay("");
    setNonAcAvailable(true);
    setNonAcPricePerDay("");
    setAmenitiesText("");
    setAddress("");
    setLocality("");
    setCity("");
    setState("");
    setPincode("");
  };




const pickImages = async () => {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Permission required",
      "Please allow photo access to select property images."
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    quality: 0.8,
    selectionLimit: 5,
  });

  if (!result.canceled) {
    const uris = result.assets.map((asset) => asset.uri);

    setSelectedPhotos(uris);
  }
};

const getCurrentLocation = async () => {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Location permission required",
        "Please allow location access to save the property location."
      );
      return;
    }

    const currentLocation =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    setLatitude(currentLocation.coords.latitude);
    setLongitude(currentLocation.coords.longitude);

    Alert.alert(
      "Location Added",
      "Property location captured successfully."
    );
  } catch (error) {
    console.error("Location error:", error);

    Alert.alert(
      "Location Error",
      "Unable to get your current location."
    );
  }
};

 const handleContinue = async () => {
  try {
    if (
      !title.trim() ||
      !address.trim() ||
      !locality.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please fill all required property details."
      );
      return;
    }

    if (pincode.length !== 6) {
      Alert.alert(
        "Invalid pincode",
        "Please enter a valid 6 digit pincode."
      );
      return;
    }

    let rent = 0;
    let deposit = 0;
    let acDailyPrice = 0;
    let nonAcDailyPrice = 0;

    if (propertyType === "hotel") {
      if (!acAvailable && !nonAcAvailable) {
        Alert.alert(
          "Room type required",
          "Please enable at least one hotel room type."
        );
        return;
      }

      if (acAvailable) {
        if (!acPricePerDay.trim()) {
          Alert.alert(
            "AC room price required",
            "Please enter the AC room per day charge."
          );
          return;
        }

        acDailyPrice = Number(acPricePerDay);

        if (Number.isNaN(acDailyPrice) || acDailyPrice <= 0) {
          Alert.alert(
            "Invalid AC room price",
            "Please enter a valid AC room per day charge."
          );
          return;
        }
      }

      if (nonAcAvailable) {
        if (!nonAcPricePerDay.trim()) {
          Alert.alert(
            "Non-AC room price required",
            "Please enter the Non-AC room per day charge."
          );
          return;
        }

        nonAcDailyPrice = Number(nonAcPricePerDay);

        if (Number.isNaN(nonAcDailyPrice) || nonAcDailyPrice <= 0) {
          Alert.alert(
            "Invalid Non-AC room price",
            "Please enter a valid Non-AC room per day charge."
          );
          return;
        }
      }
    } else {
      if (!monthlyRent.trim()) {
        Alert.alert(
          "Missing rent",
          "Please enter the monthly rent."
        );
        return;
      }

      rent = Number(monthlyRent);

      if (Number.isNaN(rent) || rent <= 0) {
        Alert.alert(
          "Invalid rent",
          "Please enter a valid monthly rent."
        );
        return;
      }

      deposit = securityDeposit.trim()
        ? Number(securityDeposit)
        : 0;

      if (Number.isNaN(deposit) || deposit < 0) {
        Alert.alert(
          "Invalid deposit",
          "Please enter a valid security deposit."
        );
        return;
      }
    }

    if (selectedPhotos.length === 0) {
      Alert.alert(
        "Photos required",
        "Please select at least one property photo."
      );
      return;
    }

    const token = await getAuthToken();

    if (!token) {
      Alert.alert(
        "Login required",
        "Your session was not found. Please login again."
      );
      return;
    }

    setLoading(true);

    // STEP 1: Upload selected images
   const formData = new FormData();

selectedPhotos.forEach((uri) => {
  const file = new File(uri);

  formData.append(
    "images",
    file as any
  );
});

const uploadResponse = await expoFetch(
  `${API_BASE_URL}/uploads/property-images`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      Alert.alert(
        "Photo upload failed",
        uploadData?.message ||
          "Unable to upload property photos."
      );
      return;
    }

    const uploadedPhotoUrls =
      Array.isArray(uploadData.images)
        ? uploadData.images
        : [];

    if (uploadedPhotoUrls.length === 0) {
      Alert.alert(
        "Photo upload failed",
        "No photo URLs were returned by the server."
      );
      return;
    }

    // STEP 2: Save property with Cloudinary URLs
    const response = await fetch(
      `${API_BASE_URL}/properties`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description:
            propertyType === "hotel"
              ? description.trim()
              : "",
          propertyType,
          monthlyRent:
            propertyType === "hotel" ? 0 : rent,
          securityDeposit:
            propertyType === "hotel" ? 0 : deposit,
          availableFor:
            propertyType === "hotel"
              ? "anyone"
              : availableFor,
          furnishing:
            propertyType === "hotel"
              ? "unfurnished"
              : furnishing,

          acAvailable:
            propertyType === "hotel"
              ? acAvailable
              : undefined,
          acPricePerDay:
            propertyType === "hotel" && acAvailable
              ? acDailyPrice
              : null,
          nonAcAvailable:
            propertyType === "hotel"
              ? nonAcAvailable
              : undefined,
          nonAcPricePerDay:
            propertyType === "hotel" && nonAcAvailable
              ? nonAcDailyPrice
              : null,

          address: address.trim(),
          locality: locality.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude,
          longitude,

          amenities:
            propertyType === "hotel"
              ? amenitiesText
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .slice(0, 30)
              : [],
          photos: uploadedPhotoUrls,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      Alert.alert(
        "Unable to add property",
        data?.message ||
          "Something went wrong while adding the property."
      );
      return;
    }

    Alert.alert(
      propertyType === "hotel"
        ? "Hotel Added"
        : "Property Added",
      propertyType === "hotel"
        ? "Your hotel and photos have been added successfully."
        : "Your property and photos have been added successfully."
    );

    resetForm();
    setSelectedPhotos([]);
  } catch (error) {
    console.error(
      "Add property error:",
      error
    );

    Alert.alert(
      "Network Error",
      "Unable to connect to the server."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FD"
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
             onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/owner-properties");
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

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="add-circle-outline"
                size={30}
                color="#635BFF"
              />
            </View>

            <Text style={styles.eyebrow}>
              NEW LISTING
            </Text>

            <Text style={styles.title}>
              Add your{"\n"}
              property.
            </Text>

            <Text style={styles.subtitle}>
              Add accurate property, location and
              photo details so renters can discover
              your listing easily.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formEyebrow}>
                  PROPERTY
                </Text>

                <Text style={styles.formTitle}>
                  Basic details
                </Text>
              </View>

              <View style={styles.formIcon}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#635BFF"
                />
              </View>
            </View>

            <Text style={styles.label}>
              {propertyType === "hotel"
                ? "Hotel name"
                : "Property title"}
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="text-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                placeholder={
                  propertyType === "hotel"
                    ? "Example: StayRent Grand Hotel"
                    : "Comfortable room near university"
                }
                placeholderTextColor="#98A2B3"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={styles.label}>
              Property type
            </Text>

            <View style={styles.chipRow}>
              {propertyTypes.map((item) => {
                const selected =
                  propertyType === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.chip,
                      selected &&
                        styles.chipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      setPropertyType(item.value)
                    }
                  >
                    <Ionicons
                      name={
                        item.value === "room"
                          ? "home-outline"
                          : item.value === "pg"
                          ? "bed-outline"
                          : item.value === "hotel"
                          ? "business"
                          : "business-outline"
                      }
                      size={15}
                      color={
                        selected
                          ? "#FFFFFF"
                          : "#667085"
                      }
                    />

                    <Text
                      style={[
                        styles.chipText,
                        selected &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {propertyType === "hotel" ? (
              <>
                <Text style={styles.label}>
                  Description
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    styles.multilineBox,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#98A2B3"
                    style={styles.multilineIcon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                    ]}
                    placeholder="Describe the hotel, nearby places and important details"
                    placeholderTextColor="#98A2B3"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <Text style={styles.label}>
                  Hotel room types & per day charge
                </Text>

                <TouchableOpacity
                  style={[
                    styles.hotelRateCard,
                    acAvailable &&
                      styles.hotelRateCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() =>
                    setAcAvailable((value) => !value)
                  }
                >
                  <View style={styles.hotelRateHeader}>
                    <View style={styles.hotelRateLabelWrap}>
                      <Ionicons
                        name="snow-outline"
                        size={18}
                        color="#635BFF"
                      />

                      <Text style={styles.hotelRateTitle}>
                        AC Room
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        acAvailable
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={22}
                      color={
                        acAvailable
                          ? "#635BFF"
                          : "#98A2B3"
                      }
                    />
                  </View>

                  {acAvailable && (
                    <View style={styles.hotelRateInput}>
                      <Text style={styles.currency}>
                        ₹
                      </Text>

                      <TextInput
                        style={styles.input}
                        placeholder="1500 per day"
                        placeholderTextColor="#98A2B3"
                        keyboardType="number-pad"
                        value={acPricePerDay}
                        onChangeText={setAcPricePerDay}
                      />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.hotelRateCard,
                    nonAcAvailable &&
                      styles.hotelRateCardSelected,
                  ]}
                  activeOpacity={0.85}
                  onPress={() =>
                    setNonAcAvailable((value) => !value)
                  }
                >
                  <View style={styles.hotelRateHeader}>
                    <View style={styles.hotelRateLabelWrap}>
                      <Ionicons
                        name="bed-outline"
                        size={18}
                        color="#635BFF"
                      />

                      <Text style={styles.hotelRateTitle}>
                        Non-AC Room
                      </Text>
                    </View>

                    <Ionicons
                      name={
                        nonAcAvailable
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={22}
                      color={
                        nonAcAvailable
                          ? "#635BFF"
                          : "#98A2B3"
                      }
                    />
                  </View>

                  {nonAcAvailable && (
                    <View style={styles.hotelRateInput}>
                      <Text style={styles.currency}>
                        ₹
                      </Text>

                      <TextInput
                        style={styles.input}
                        placeholder="900 per day"
                        placeholderTextColor="#98A2B3"
                        keyboardType="number-pad"
                        value={nonAcPricePerDay}
                        onChangeText={setNonAcPricePerDay}
                      />
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>
                  Amenities
                </Text>

                <View style={styles.inputBox}>
                  <Ionicons
                    name="sparkles-outline"
                    size={18}
                    color="#98A2B3"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="WiFi, Parking, TV, Hot Water"
                    placeholderTextColor="#98A2B3"
                    value={amenitiesText}
                    onChangeText={setAmenitiesText}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.twoColumnRow}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>
                      Monthly rent
                    </Text>

                    <View style={styles.inputBox}>
                      <Text style={styles.currency}>
                        ₹
                      </Text>

                      <TextInput
                        style={styles.input}
                        placeholder="5000"
                        placeholderTextColor="#98A2B3"
                        keyboardType="number-pad"
                        value={monthlyRent}
                        onChangeText={setMonthlyRent}
                      />
                    </View>
                  </View>

                  <View style={styles.halfField}>
                    <Text style={styles.label}>
                      Security deposit
                    </Text>

                    <View style={styles.inputBox}>
                      <Text style={styles.currency}>
                        ₹
                      </Text>

                      <TextInput
                        style={styles.input}
                        placeholder="5000"
                        placeholderTextColor="#98A2B3"
                        keyboardType="number-pad"
                        value={securityDeposit}
                        onChangeText={setSecurityDeposit}
                      />
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>
                  Available for
                </Text>

                <View style={styles.chipRow}>
                  {availableOptions.map((item) => {
                    const selected =
                      availableFor === item.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.chip,
                          selected &&
                            styles.chipSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          setAvailableFor(item.value)
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>
                  Furnishing
                </Text>

                <View style={styles.chipRow}>
                  {furnishingOptions.map((item) => {
                    const selected =
                      furnishing === item.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.chip,
                          selected &&
                            styles.chipSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          setFurnishing(item.value)
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formEyebrow}>
                  LOCATION
                </Text>

                <Text style={styles.formTitle}>
                  Address details
                </Text>
              </View>

              <View style={styles.formIcon}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#635BFF"
                />
              </View>
            </View>

            <Text style={styles.label}>
              Full address
            </Text>

            <View
              style={[
                styles.inputBox,
                styles.multilineBox,
              ]}
            >
              <Ionicons
                name="navigate-outline"
                size={18}
                color="#98A2B3"
                style={styles.multilineIcon}
              />

              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                placeholder="House number, street, nearby landmark"
                placeholderTextColor="#98A2B3"
                multiline
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <Text style={styles.label}>
              Locality / Area
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="map-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                placeholder="Example: Deepugrah"
                placeholderTextColor="#98A2B3"
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            <Text style={styles.label}>
              City
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="business-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                placeholder="Example: Garhwa"
                placeholderTextColor="#98A2B3"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <Text style={styles.label}>
              State
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="map-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                placeholder="Example: Jharkhand"
                placeholderTextColor="#98A2B3"
                value={state}
                onChangeText={setState}
              />
            </View>

            <Text style={styles.label}>
              Pincode
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="pin-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter 6 digit pincode"
                placeholderTextColor="#98A2B3"
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />
            </View>

            <Text style={styles.label}>
              Property location
            </Text>

            <TouchableOpacity
              style={[
                styles.locationButton,
                latitude !== null &&
                  longitude !== null &&
                  styles.locationButtonAdded,
              ]}
              activeOpacity={0.85}
              onPress={getCurrentLocation}
            >
              <View
                style={[
                  styles.locationIcon,
                  latitude !== null &&
                    longitude !== null &&
                    styles.locationIconAdded,
                ]}
              >
                <Ionicons
                  name={
                    latitude !== null &&
                    longitude !== null
                      ? "checkmark"
                      : "locate-outline"
                  }
                  size={20}
                  color={
                    latitude !== null &&
                    longitude !== null
                      ? "#12B76A"
                      : "#635BFF"
                  }
                />
              </View>

              <View style={styles.locationTextWrap}>
                <Text
                  style={styles.locationButtonText}
                >
                  {latitude !== null &&
                  longitude !== null
                    ? "Location added"
                    : "Use current location"}
                </Text>

                <Text
                  style={styles.locationButtonSubtext}
                >
                  {latitude !== null &&
                  longitude !== null
                    ? "GPS coordinates captured successfully"
                    : "Use GPS to pin this property on the map"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#98A2B3"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formEyebrow}>
                  MEDIA
                </Text>

                <Text style={styles.formTitle}>
                  Property photos
                </Text>
              </View>

              <View style={styles.formIcon}>
                <Ionicons
                  name="images-outline"
                  size={20}
                  color="#635BFF"
                />
              </View>
            </View>

            <Text style={styles.photoHint}>
              Add 1–5 clear photos. The first photo
              will be used as the main listing image.
            </Text>

            <TouchableOpacity
              style={styles.photoButton}
              activeOpacity={0.85}
              onPress={pickImages}
            >
              <View style={styles.photoButtonIcon}>
                <Ionicons
                  name="images-outline"
                  size={22}
                  color="#635BFF"
                />
              </View>

              <View style={styles.photoButtonTextWrap}>
                <Text
                  style={styles.photoButtonText}
                >
                  Select Photos
                </Text>

                <Text
                  style={styles.photoButtonSubtext}
                >
                  {selectedPhotos.length > 0
                    ? `${selectedPhotos.length} photo(s) selected`
                    : "Choose images from your gallery"}
                </Text>
              </View>

              <Ionicons
                name="add-circle-outline"
                size={21}
                color="#635BFF"
              />
            </TouchableOpacity>

            {selectedPhotos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photoList}
              >
                {selectedPhotos.map(
                  (uri, index) => (
                    <View
                      key={`${uri}-${index}`}
                      style={styles.photoPreviewWrap}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.photoPreview}
                      />

                      <View
                        style={styles.photoNumber}
                      >
                        <Text
                          style={
                            styles.photoNumberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  Adding Property...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  {propertyType === "hotel"
                    ? "Add Hotel"
                    : "Add Property"}
                </Text>

                <View style={styles.buttonArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#635BFF"
                  />
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.secureNote}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color="#12B76A"
            />

            <Text style={styles.secureNoteText}>
              Your property will be added using
              your authenticated owner account.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },

  keyboardView: {
    flex: 1,
  },

  glowOne: {
    position: "absolute",
    width: 270,
    height: 270,
    borderRadius: 135,
    top: -130,
    right: -130,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 40,
    left: -155,
    backgroundColor: "#F5F3FF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
  },

  header: {
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

  hero: {
    marginTop: 30,
    marginBottom: 24,
  },

  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  eyebrow: {
    marginTop: 18,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#635BFF",
  },

  title: {
    marginTop: 8,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#111827",
  },

  subtitle: {
    marginTop: 11,
    maxWidth: 330,
    fontSize: 13,
    lineHeight: 21,
    color: "#667085",
  },

  formCard: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },

  formHeader: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  formEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#635BFF",
  },

  formTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  formIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  label: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    color: "#344054",
  },

  inputBox: {
    minHeight: 54,
    marginBottom: 17,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FBFCFE",
  },

  input: {
    flex: 1,
    marginLeft: 9,
    minHeight: 52,
    fontSize: 14,
    color: "#111827",
  },

  multilineBox: {
    minHeight: 94,
    alignItems: "flex-start",
  },

  multilineIcon: {
    marginTop: 17,
  },

  multilineInput: {
    minHeight: 90,
    paddingTop: 15,
    textAlignVertical: "top",
  },

  chipRow: {
    marginBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
  },

  chipSelected: {
    backgroundColor: "#635BFF",
    borderColor: "#635BFF",
  },

  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475467",
  },

  chipTextSelected: {
    color: "#FFFFFF",
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  currency: {
    fontSize: 15,
    fontWeight: "900",
    color: "#635BFF",
  },

  hotelRateCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FBFCFE",
  },

  hotelRateCardSelected: {
    borderColor: "#C7C3FF",
    backgroundColor: "#F8F7FF",
  },

  hotelRateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hotelRateLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  hotelRateTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#344054",
  },

  hotelRateInput: {
    minHeight: 52,
    marginTop: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FFFFFF",
  },

  locationButton: {
    minHeight: 68,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    backgroundColor: "#F8F7FF",
  },

  locationButtonAdded: {
    borderColor: "#ABEFC6",
    backgroundColor: "#F6FEF9",
  },

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  locationIconAdded: {
    backgroundColor: "#ECFDF3",
  },

  locationTextWrap: {
    flex: 1,
    marginLeft: 11,
  },

  locationButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  locationButtonSubtext: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    color: "#98A2B3",
  },

  photoHint: {
    marginBottom: 14,
    fontSize: 11,
    lineHeight: 18,
    color: "#667085",
  },

  photoButton: {
    minHeight: 68,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    backgroundColor: "#F8F7FF",
  },

  photoButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  photoButtonTextWrap: {
    flex: 1,
    marginLeft: 11,
  },

  photoButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  photoButtonSubtext: {
    marginTop: 3,
    fontSize: 9,
    color: "#98A2B3",
  },

  photoList: {
    marginTop: 14,
  },

  photoPreviewWrap: {
    position: "relative",
    marginRight: 10,
  },

  photoPreview: {
    width: 116,
    height: 92,
    borderRadius: 14,
    backgroundColor: "#EEF0F6",
  },

  photoNumber: {
    position: "absolute",
    right: 6,
    bottom: 6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17,24,39,0.78)",
  },

  photoNumberText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  button: {
    height: 60,
    marginTop: 2,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  buttonArrow: {
    position: "absolute",
    right: 9,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  secureNote: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secureNoteText: {
    marginLeft: 6,
    maxWidth: 300,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    color: "#667085",
  },
});
