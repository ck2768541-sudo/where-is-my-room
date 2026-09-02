
import { useState } from "react";

import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import * as Location from "expo-location";
import {
      
  Alert,
   Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "../utils/authStorage";
import { COLORS } from "../constants/colors";

type PropertyType = "room" | "pg" | "flat";
type AvailableFor = "anyone" | "male" | "female" | "family";
type Furnishing =
  | "furnished"
  | "semi-furnished"
  | "unfurnished";

export default function OwnerAddPropertyScreen() {
  const [title, setTitle] = useState("");

  const [propertyType, setPropertyType] =
    useState<PropertyType>("room");

  const [monthlyRent, setMonthlyRent] = useState("");

  const [securityDeposit, setSecurityDeposit] =
    useState("");

  const [availableFor, setAvailableFor] =
    useState<AvailableFor>("anyone");

  const [furnishing, setFurnishing] =
    useState<Furnishing>("unfurnished");

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
    setPropertyType("room");
    setMonthlyRent("");
    setSecurityDeposit("");
    setAvailableFor("anyone");
    setFurnishing("unfurnished");
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
      !monthlyRent.trim() ||
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

    const rent = Number(monthlyRent);

    if (Number.isNaN(rent) || rent <= 0) {
      Alert.alert(
        "Invalid rent",
        "Please enter a valid monthly rent."
      );
      return;
    }

    const deposit = securityDeposit.trim()
      ? Number(securityDeposit)
      : 0;

    if (Number.isNaN(deposit) || deposit < 0) {
      Alert.alert(
        "Invalid deposit",
        "Please enter a valid security deposit."
      );
      return;
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
          propertyType,
          monthlyRent: rent,
          securityDeposit: deposit,
          availableFor,
          furnishing,

          address: address.trim(),
          locality: locality.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude,
longitude,

          amenities: [],
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
      "Property Added",
      "Your property and photos have been added successfully."
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
          <Text style={styles.brand}>
            StayRent
          </Text>

          <Text style={styles.title}>
            Add your property
          </Text>

          <Text style={styles.subtitle}>
            Add accurate details so renters can easily
            discover your property.
          </Text>

          <Text style={styles.label}>
            Property Title
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Comfortable room near university"
            placeholderTextColor={
              COLORS.textSecondary
            }
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>
            Property Type
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
                    setPropertyType(
                      item.value
                    )
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
            Monthly Rent
          </Text>

          <TextInput
            style={styles.input}
            placeholder="₹ Example: 5000"
            placeholderTextColor={
              COLORS.textSecondary
            }
            keyboardType="number-pad"
            value={monthlyRent}
            onChangeText={setMonthlyRent}
          />

          <Text style={styles.label}>
            Security Deposit
          </Text>

          <TextInput
            style={styles.input}
            placeholder="₹ Example: 5000"
            placeholderTextColor={
              COLORS.textSecondary
            }
            keyboardType="number-pad"
            value={securityDeposit}
            onChangeText={
              setSecurityDeposit
            }
          />

          <Text style={styles.label}>
            Available For
          </Text>

          <View style={styles.chipRow}>
            {availableOptions.map(
              (item) => {
                const selected =
                  availableFor ===
                  item.value;

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
                      setAvailableFor(
                        item.value
                      )
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
              }
            )}
          </View>

          <Text style={styles.label}>
            Furnishing
          </Text>

          <View style={styles.chipRow}>
            {furnishingOptions.map(
              (item) => {
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
                      setFurnishing(
                        item.value
                      )
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
              }
            )}
          </View>

          <Text style={styles.label}>
            Full Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multiline,
            ]}
            placeholder="House number, street, nearby landmark"
            placeholderTextColor={
              COLORS.textSecondary
            }
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>
            Locality / Area
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Deepugrah"
            placeholderTextColor={
              COLORS.textSecondary
            }
            value={locality}
            onChangeText={setLocality}
          />

          <Text style={styles.label}>
            City
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Garhwa"
            placeholderTextColor={
              COLORS.textSecondary
            }
            value={city}
            onChangeText={setCity}
          />

          <Text style={styles.label}>
            State
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Example: Jharkhand"
            placeholderTextColor={
              COLORS.textSecondary
            }
            value={state}
            onChangeText={setState}
          />

          <Text style={styles.label}>
  Property Location
</Text>

<TouchableOpacity
  style={styles.locationButton}
  activeOpacity={0.85}
  onPress={getCurrentLocation}
>
  <Text style={styles.locationButtonText}>
    {latitude && longitude
      ? "Location Added ✓"
      : "Use Current Location"}
  </Text>
</TouchableOpacity>

          <Text style={styles.label}>
            Pincode
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 6 digit pincode"
            placeholderTextColor={
              COLORS.textSecondary
            }
            keyboardType="number-pad"
            maxLength={6}
            value={pincode}
            onChangeText={setPincode}
          />

          

<Text style={styles.label}>
  Property Photos
</Text>

<TouchableOpacity
  style={styles.photoButton}
  activeOpacity={0.8}
  onPress={pickImages}
>
  <Text style={styles.photoButtonText}>
    Select Photos
  </Text>
</TouchableOpacity>

{selectedPhotos.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.photoList}
  >
    {selectedPhotos.map((uri, index) => (
      <Image
        key={`${uri}-${index}`}
        source={{ uri }}
        style={styles.photoPreview}
      />
    ))}
  </ScrollView>
)}
  


          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Adding Property..."
                : "Add Property"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
  },

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  input: {
    minHeight: 54,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },

  multiline: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  chipTextSelected: {
    color: COLORS.surface,
  },

photoButton: {
  height: 52,
  borderWidth: 1,
  borderColor: COLORS.primary,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surface,
  marginBottom: 14,
},

photoButtonText: {
  color: COLORS.primary,
  fontSize: 16,
  fontWeight: "700",
},

photoList: {
  marginBottom: 22,
},

photoPreview: {
  width: 110,
  height: 90,
  borderRadius: 12,
  marginRight: 10,
},





  button: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.surface,
  },

locationButton: {
  height: 52,
  borderWidth: 1,
  borderColor: COLORS.primary,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.surface,
  marginBottom: 20,
},

locationButtonText: {
  fontSize: 15,
  fontWeight: "700",
  color: COLORS.primary,
},


});