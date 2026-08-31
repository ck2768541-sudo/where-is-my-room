import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { getAuthToken } from "../utils/authStorage";

type PropertyType = "room" | "pg" | "flat";
type AvailableFor = "anyone" | "male" | "female" | "family";
type Furnishing =
  | "furnished"
  | "semi-furnished"
  | "unfurnished";

type Property = {
  _id: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  monthlyRent: number;
  securityDeposit?: number;
  availableFor: AvailableFor;
  furnishing?: Furnishing;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
};

export default function OwnerEditPropertyScreen() {
  const router = useRouter();

  const { propertyId } = useLocalSearchParams<{
    propertyId: string;
  }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [propertyType, setPropertyType] =
    useState<PropertyType>("room");

  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");

  const [availableFor, setAvailableFor] =
    useState<AvailableFor>("anyone");

  const [furnishing, setFurnishing] =
    useState<Furnishing>("unfurnished");

  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const propertyTypes = [
    { label: "Room", value: "room" as PropertyType },
    { label: "PG", value: "pg" as PropertyType },
    { label: "Flat", value: "flat" as PropertyType },
  ];

  const availableOptions = [
    { label: "Anyone", value: "anyone" as AvailableFor },
    { label: "Male", value: "male" as AvailableFor },
    { label: "Female", value: "female" as AvailableFor },
    { label: "Family", value: "family" as AvailableFor },
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

  const loadProperty = async () => {
    try {
      setLoading(true);
      setError("");

      if (!propertyId) {
        setError("Property ID not found.");
        return;
      }

      const token = await getAuthToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to load property."
        );
        return;
      }

      const property: Property = data.property;

      setTitle(property.title || "");
      setDescription(property.description || "");
      setPropertyType(property.propertyType);
      setMonthlyRent(String(property.monthlyRent || ""));
      setSecurityDeposit(
        String(property.securityDeposit || "")
      );
      setAvailableFor(property.availableFor);
      setFurnishing(
        property.furnishing || "unfurnished"
      );
      setAddress(property.address || "");
      setLocality(property.locality || "");
      setCity(property.city || "");
      setState(property.state || "");
      setPincode(property.pincode || "");
    } catch (error) {
      console.error("Load property error:", error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const handleSave = async () => {
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
          "Please fill all required fields."
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
      const deposit = securityDeposit.trim()
        ? Number(securityDeposit)
        : 0;

      if (Number.isNaN(rent) || rent <= 0) {
        Alert.alert(
          "Invalid rent",
          "Please enter a valid monthly rent."
        );
        return;
      }

      if (Number.isNaN(deposit) || deposit < 0) {
        Alert.alert(
          "Invalid deposit",
          "Please enter a valid security deposit."
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

      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/properties/${propertyId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Update failed",
          data?.message ||
            "Unable to update property."
        );
        return;
      }

      Alert.alert(
        "Property Updated",
        "Your property has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/owner-properties"),
          },
        ]
      );
    } catch (error) {
      console.error("Update property error:", error);

      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading property...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProperty}
          >
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
            Where Is My Room
          </Text>

          <Text style={styles.title}>
            Edit Property
          </Text>

          <Text style={styles.subtitle}>
            Update your rental property details.
          </Text>

          <Text style={styles.label}>
            Property Title
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Property title"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multiline,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell renters about this property"
            placeholderTextColor={COLORS.textSecondary}
            multiline
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
                  onPress={() =>
                    setPropertyType(item.value)
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
            value={monthlyRent}
            onChangeText={setMonthlyRent}
            keyboardType="number-pad"
            placeholder="Monthly rent"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            Security Deposit
          </Text>

          <TextInput
            style={styles.input}
            value={securityDeposit}
            onChangeText={setSecurityDeposit}
            keyboardType="number-pad"
            placeholder="Security deposit"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            Available For
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

          <Text style={styles.label}>
            Full Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multiline,
            ]}
            value={address}
            onChangeText={setAddress}
            multiline
            placeholder="Full address"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            Locality / Area
          </Text>

          <TextInput
            style={styles.input}
            value={locality}
            onChangeText={setLocality}
            placeholder="Locality"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            City
          </Text>

          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            State
          </Text>

          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>
            Pincode
          </Text>

          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Pincode"
            placeholderTextColor={COLORS.textSecondary}
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator
                color={COLORS.surface}
              />
            ) : (
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },

  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.error,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },

  retryText: {
    color: COLORS.surface,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 50,
  },

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 18,
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
    marginTop: 8,
    marginBottom: 28,
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

  saveButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.surface,
  },

  cancelButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
});