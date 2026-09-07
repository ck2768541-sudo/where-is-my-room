import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
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

const PRIVACY_POLICY_URL = "https://stayrent.in/privacy-policy";
const TERMS_OF_USE_URL = "https://stayrent.in/terms-of-use";

export default function OwnerRegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(18)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateAccount = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing details",
        "Please fill all fields."
      );
      return;
    }

    if (phone.trim().length !== 10) {
      Alert.alert(
        "Invalid phone number",
        "Please enter a valid 10 digit phone number."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password mismatch",
        "Password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
            role: "owner",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Registration failed",
          data.message ||
            "Unable to create owner account."
        );
        return;
      }

      Alert.alert(
        "Account created",
        "Your owner account has been created successfully.",
        [
          {
            text: "Login",
            onPress: () =>
              router.replace("/owner-login"),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Owner register error:",
        error
      );

      Alert.alert(
        "Connection error",
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.animatedContent,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim,
                  },
                ],
              },
            ]}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.8}
               onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/role-select");
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
                  <Image
                    source={require("../../assets/stayrent-logo.jpeg")}
                    style={styles.brandLogoImage}
                    resizeMode="contain"
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
                  name="business-outline"
                  size={28}
                  color="#635BFF"
                />
              </View>

              <Text style={styles.eyebrow}>
                FOR PROPERTY OWNERS
              </Text>

              <Text style={styles.title}>
                List your property.{"\n"}
                Reach more renters.
              </Text>

              <Text style={styles.subtitle}>
                Create your owner account to list,
                manage and update your rental
                properties from one place.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <View>
                  <Text style={styles.formEyebrow}>
                    GET STARTED
                  </Text>

                  <Text style={styles.formTitle}>
                    Create owner account
                  </Text>
                </View>

                <View style={styles.formIcon}>
                  <Ionicons
                    name="key-outline"
                    size={19}
                    color="#635BFF"
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                Personal details
              </Text>

              <Text style={styles.label}>
                Full name
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#98A2B3"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.label}>
                Email address
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#98A2B3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.label}>
                Phone number
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="call-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter 10 digit phone number"
                  placeholderTextColor="#98A2B3"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>

              <View style={styles.sectionDivider} />

              <Text style={styles.sectionTitle}>
                Secure account
              </Text>

              <Text style={styles.label}>
                Password
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#98A2B3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color="#98A2B3"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.passwordHint}>
                Minimum 6 characters
              </Text>

              <Text style={styles.label}>
                Confirm password
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter password again"
                  placeholderTextColor="#98A2B3"
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color="#98A2B3"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.legalRow}>
                <Text style={styles.legalText}>
                  By creating an account, you agree to StayRent&apos;s{" "}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Linking.openURL(TERMS_OF_USE_URL)
                  }
                >
                  <Text style={styles.legalLink}>
                    Terms of Use
                  </Text>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                  {" "}and{" "}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    Linking.openURL(PRIVACY_POLICY_URL)
                  }
                >
                  <Text style={styles.legalLink}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
                <Text style={styles.legalText}>.</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading &&
                    styles.createButtonDisabled,
                ]}
                activeOpacity={0.9}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.createButtonText
                      }
                    >
                      Create Owner Account
                    </Text>

                    <View
                      style={
                        styles.buttonArrow
                      }
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

              <View style={styles.secureNote}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color="#12B76A"
                />

                <Text
                  style={
                    styles.secureNoteText
                  }
                >
                  Your account information is
                  securely protected.
                </Text>
              </View>
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an owner account?
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.replace(
                    "/owner-login"
                  )
                }
              >
                <Text style={styles.loginLink}>
                  {" "}
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
    right: -125,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 30,
    left: -150,
    backgroundColor: "#F5F3FF",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 32,
  },

  animatedContent: {
    flexGrow: 1,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    alignItems: "center",
    justifyContent: "center",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#635BFF",
    alignItems: "center",
    justifyContent: "center",
  },

  brandLogoImage: {
    width: 31,
    height: 31,
    borderRadius: 10,
  },

  brand: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#111827",
  },

  hero: {
    marginTop: 34,
  },

  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: "#F1EFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    marginTop: 20,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#635BFF",
  },

  title: {
    marginTop: 9,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#111827",
  },

  subtitle: {
    marginTop: 12,
    maxWidth: 330,
    fontSize: 14,
    lineHeight: 22,
    color: "#667085",
  },

  formCard: {
    marginTop: 28,
    padding: 20,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  formEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.25,
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
    backgroundColor: "#F1EFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    marginBottom: 14,
    fontSize: 13,
    fontWeight: "800",
    color: "#344054",
  },

  sectionDivider: {
    height: 1,
    marginTop: 4,
    marginBottom: 20,
    backgroundColor: "#F0F1F4",
  },

  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#344054",
  },

  inputBox: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FBFCFE",
    marginBottom: 17,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  passwordHint: {
    marginTop: -9,
    marginLeft: 2,
    marginBottom: 17,
    fontSize: 10,
    color: "#98A2B3",
  },

  legalRow: {
    marginTop: 4,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 4,
  },

  legalText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#667085",
    textAlign: "center",
  },

  legalLink: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    color: "#635BFF",
  },

  createButton: {
    height: 60,
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#635BFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#635BFF",
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  createButtonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  secureNote: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secureNoteText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "600",
    color: "#667085",
  },

  loginRow: {
    marginTop: 24,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },

  loginText: {
    fontSize: 13,
    color: "#667085",
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#635BFF",
  },
});
