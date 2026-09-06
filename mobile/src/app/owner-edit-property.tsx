import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

type Property = {
  _id: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  monthlyRent: number;
  acAvailable?: boolean;
  acPricePerDay?: number | null;
  nonAcAvailable?: boolean;
  nonAcPricePerDay?: number | null;
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

  const [acAvailable, setAcAvailable] = useState(false);
  const [acPricePerDay, setAcPricePerDay] = useState("");
  const [nonAcAvailable, setNonAcAvailable] = useState(false);
  const [nonAcPricePerDay, setNonAcPricePerDay] = useState("");

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
    { label: "Hotel", value: "hotel" as PropertyType },
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
      setMonthlyRent(
        property.propertyType === "hotel"
          ? ""
          : String(property.monthlyRent || "")
      );

      setAcAvailable(property.acAvailable === true);
      setAcPricePerDay(
        property.acPricePerDay !== null &&
        property.acPricePerDay !== undefined
          ? String(property.acPricePerDay)
          : ""
      );

      setNonAcAvailable(property.nonAcAvailable === true);
      setNonAcPricePerDay(
        property.nonAcPricePerDay !== null &&
        property.nonAcPricePerDay !== undefined
          ? String(property.nonAcPricePerDay)
          : ""
      );

      setSecurityDeposit(
        property.propertyType === "hotel"
          ? ""
          : String(property.securityDeposit || "")
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

      let rent = 0;
      let deposit = 0;
      let acPrice: number | null = null;
      let nonAcPrice: number | null = null;

      if (propertyType === "hotel") {
        if (!acAvailable && !nonAcAvailable) {
          Alert.alert(
            "Room type required",
            "Please make at least AC or Non-AC available."
          );
          return;
        }

        if (acAvailable) {
          if (!acPricePerDay.trim()) {
            Alert.alert(
              "AC price required",
              "Please enter AC per-day price."
            );
            return;
          }

          acPrice = Number(acPricePerDay);

          if (!Number.isFinite(acPrice) || acPrice < 0) {
            Alert.alert(
              "Invalid AC price",
              "Please enter a valid AC per-day price."
            );
            return;
          }
        }

        if (nonAcAvailable) {
          if (!nonAcPricePerDay.trim()) {
            Alert.alert(
              "Non-AC price required",
              "Please enter Non-AC per-day price."
            );
            return;
          }

          nonAcPrice = Number(nonAcPricePerDay);

          if (!Number.isFinite(nonAcPrice) || nonAcPrice < 0) {
            Alert.alert(
              "Invalid Non-AC price",
              "Please enter a valid Non-AC per-day price."
            );
            return;
          }
        }
      } else {
        if (!monthlyRent.trim()) {
          Alert.alert(
            "Missing details",
            "Please enter monthly rent."
          );
          return;
        }

        rent = Number(monthlyRent);
        deposit = securityDeposit.trim()
          ? Number(securityDeposit)
          : 0;

        if (!Number.isFinite(rent) || rent <= 0) {
          Alert.alert(
            "Invalid rent",
            "Please enter a valid monthly rent."
          );
          return;
        }

        if (!Number.isFinite(deposit) || deposit < 0) {
          Alert.alert(
            "Invalid deposit",
            "Please enter a valid security deposit."
          );
          return;
        }
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

            monthlyRent:
              propertyType === "hotel"
                ? 0
                : rent,

            securityDeposit:
              propertyType === "hotel"
                ? 0
                : deposit,

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
                : false,

            acPricePerDay:
              propertyType === "hotel" && acAvailable
                ? acPrice
                : null,

            nonAcAvailable:
              propertyType === "hotel"
                ? nonAcAvailable
                : false,

            nonAcPricePerDay:
              propertyType === "hotel" && nonAcAvailable
                ? nonAcPrice
                : null,

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
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.centerContainer}>
          <View style={styles.loadingIconBox}>
            <ActivityIndicator
              size="small"
              color="#635BFF"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading property
          </Text>

          <Text style={styles.loadingText}>
            Getting the latest property details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <TouchableOpacity
          style={styles.errorBackButton}
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

        <View style={styles.centerContainer}>
          <View style={styles.errorIconBox}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#F04438"
            />
          </View>

          <Text style={styles.errorTitle}>
            Unable to load property
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.9}
            onPress={loadProperty}
          >
            <Ionicons
              name="refresh"
              size={17}
              color="#FFFFFF"
            />

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
              disabled={saving}
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
                name="create-outline"
                size={29}
                color="#635BFF"
              />
            </View>

            <Text style={styles.eyebrow}>
              UPDATE LISTING
            </Text>

            <Text style={styles.title}>
              Edit your{"\n"}
              property.
            </Text>

            <Text style={styles.subtitle}>
              Keep your rental information accurate
              so renters always see the latest
              property details.
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
              Property title
            </Text>

            <View style={styles.inputBox}>
              <Ionicons
                name="text-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Property title"
                placeholderTextColor="#98A2B3"
              />
            </View>

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
                value={description}
                onChangeText={setDescription}
                placeholder="Tell renters about this property"
                placeholderTextColor="#98A2B3"
                multiline
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
                          ? "business-outline"
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
                  Hotel room options
                </Text>

                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      acAvailable && styles.chipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      setAcAvailable((current) => !current)
                    }
                  >
                    <Ionicons
                      name="snow-outline"
                      size={15}
                      color={
                        acAvailable
                          ? "#FFFFFF"
                          : "#667085"
                      }
                    />

                    <Text
                      style={[
                        styles.chipText,
                        acAvailable &&
                          styles.chipTextSelected,
                      ]}
                    >
                      AC Available
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.chip,
                      nonAcAvailable && styles.chipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      setNonAcAvailable((current) => !current)
                    }
                  >
                    <Ionicons
                      name="bed-outline"
                      size={15}
                      color={
                        nonAcAvailable
                          ? "#FFFFFF"
                          : "#667085"
                      }
                    />

                    <Text
                      style={[
                        styles.chipText,
                        nonAcAvailable &&
                          styles.chipTextSelected,
                      ]}
                    >
                      Non-AC Available
                    </Text>
                  </TouchableOpacity>
                </View>

                {acAvailable ? (
                  <>
                    <Text style={styles.label}>
                      AC price per day
                    </Text>

                    <View style={styles.inputBox}>
                      <Text style={styles.currency}>
                        ₹
                      </Text>

                      <TextInput
                        style={styles.input}
                        value={acPricePerDay}
                        onChangeText={setAcPricePerDay}
                        keyboardType="number-pad"
                        placeholder="AC per-day price"
                        placeholderTextColor="#98A2B3"
                      />
                    </View>
                  </>
                ) : null}

                {nonAcAvailable ? (
                  <>
                    <Text style={styles.label}>
                      Non-AC price per day
                    </Text>

                    <View style={styles.inputBox}>
                      <Text style={styles.currency}>
                        ₹
                      </Text>

                      <TextInput
                        style={styles.input}
                        value={nonAcPricePerDay}
                        onChangeText={setNonAcPricePerDay}
                        keyboardType="number-pad"
                        placeholder="Non-AC per-day price"
                        placeholderTextColor="#98A2B3"
                      />
                    </View>
                  </>
                ) : null}
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
                        value={monthlyRent}
                        onChangeText={setMonthlyRent}
                        keyboardType="number-pad"
                        placeholder="Monthly rent"
                        placeholderTextColor="#98A2B3"
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
                        value={securityDeposit}
                        onChangeText={setSecurityDeposit}
                        keyboardType="number-pad"
                        placeholder="Deposit"
                        placeholderTextColor="#98A2B3"
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
                value={address}
                onChangeText={setAddress}
                multiline
                placeholder="Full address"
                placeholderTextColor="#98A2B3"
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
                value={locality}
                onChangeText={setLocality}
                placeholder="Locality"
                placeholderTextColor="#98A2B3"
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
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#98A2B3"
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
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#98A2B3"
              />
            </View>

            <Text style={styles.label}>
              Pincode
            </Text>

            <View
              style={[
                styles.inputBox,
                styles.lastInputBox,
              ]}
            >
              <Ionicons
                name="pin-outline"
                size={18}
                color="#98A2B3"
              />

              <TextInput
                style={styles.input}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Pincode"
                placeholderTextColor="#98A2B3"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            activeOpacity={0.9}
            disabled={saving}
            onPress={handleSave}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={styles.saveButtonText}
                >
                  Saving Changes...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.saveButtonText}
                >
                  Save Changes
                </Text>

                <View
                  style={styles.buttonArrow}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#635BFF"
                  />
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/owner-properties");
  }
}}
            disabled={saving}
          >
            <Ionicons
              name="close-outline"
              size={18}
              color="#667085"
            />

            <Text
              style={styles.cancelButtonText}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <View style={styles.infoNote}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#635BFF"
            />

            <Text style={styles.infoNoteText}>
              This screen updates property details
              only. Existing photos and GPS location
              remain unchanged.
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  loadingText: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#98A2B3",
  },

  errorBackButton: {
    position: "absolute",
    top: 18,
    left: 20,
    zIndex: 5,
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  errorTitle: {
    marginTop: 17,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    maxWidth: 300,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#667085",
  },

  retryButton: {
    height: 50,
    marginTop: 20,
    paddingHorizontal: 19,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#635BFF",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
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

  lastInputBox: {
    marginBottom: 0,
  },

  input: {
    flex: 1,
    marginLeft: 9,
    minHeight: 52,
    fontSize: 14,
    color: "#111827",
  },

  multilineBox: {
    minHeight: 96,
    alignItems: "flex-start",
  },

  multilineIcon: {
    marginTop: 17,
  },

  multilineInput: {
    minHeight: 92,
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

  saveButton: {
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

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
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

  cancelButton: {
    height: 50,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 15,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#667085",
  },

  infoNote: {
    marginTop: 8,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    backgroundColor: "#F7F5FF",
  },

  infoNoteText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    color: "#667085",
  },
});
