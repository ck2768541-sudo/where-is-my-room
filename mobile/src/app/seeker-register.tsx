import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
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

export default function SeekerRegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(20)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email
              .trim()
              .toLowerCase(),
            phone: phone.trim(),
            password,
            role: "seeker",
            seekerType: "other",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          "Registration failed",
          data.message ||
            "Unable to create account."
        );
        return;
      }

      Alert.alert(
        "Account created",
        "Your account has been created successfully.",
        [
          {
            text: "Login",
            onPress: () =>
              router.replace(
                "/seeker-login"
              ),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Register request error:",
        error
      );

      Alert.alert(
        "Connection error",
        "Unable to connect to the server. Make sure your backend is running and your phone and laptop are on the same Wi-Fi."
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
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY:
                    slideAnim,
                },
              ],
            }}
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
                <View
                  style={
                    styles.brandLogo
                  }
                >
                  <Ionicons
                    name="home"
                    size={17}
                    color="#FFFFFF"
                  />
                </View>

                <Text
                  style={styles.brand}
                >
                  StayRent
                </Text>
              </View>
            </View>

            <View style={styles.hero}>
              <View
                style={styles.heroIcon}
              >
                <Ionicons
                  name="person-add-outline"
                  size={26}
                  color="#635BFF"
                />
              </View>

              <Text
                style={styles.eyebrow}
              >
                CREATE YOUR ACCOUNT
              </Text>

              <Text style={styles.title}>
                Find your next
                {"\n"}
                place with StayRent.
              </Text>

              <Text
                style={styles.subtitle}
              >
                Create your renter profile
                and start discovering rooms,
                PGs and flats near you.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Personal details
                </Text>

                <Text
                  style={
                    styles.sectionStep
                  }
                >
                  01
                </Text>
              </View>

              <Text style={styles.label}>
                Full name
              </Text>

              <View
                style={styles.inputBox}
              >
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

              <View
                style={styles.inputBox}
              >
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

              <View
                style={styles.inputBox}
              >
                <Ionicons
                  name="call-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="10 digit phone number"
                  placeholderTextColor="#98A2B3"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>

              <View
                style={
                  styles.sectionDivider
                }
              />

              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Secure your account
                </Text>

                <Text
                  style={
                    styles.sectionStep
                  }
                >
                  02
                </Text>
              </View>

              <Text style={styles.label}>
                Password
              </Text>

              <View
                style={styles.inputBox}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color="#98A2B3"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#98A2B3"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  value={password}
                  onChangeText={
                    setPassword
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      (current) =>
                        !current
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

              <Text
                style={
                  styles.passwordHint
                }
              >
                Minimum 6 characters
              </Text>

              <Text style={styles.label}>
                Confirm password
              </Text>

              <View
                style={styles.inputBox}
              >
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
                  value={
                    confirmPassword
                  }
                  onChangeText={
                    setConfirmPassword
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
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

              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading &&
                    styles.createButtonDisabled,
                ]}
                activeOpacity={0.9}
                onPress={
                  handleCreateAccount
                }
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
                      Create Account
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

              <View
                style={styles.secureNote}
              >
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
                  Your account details are
                  securely stored.
                </Text>
              </View>
            </View>

            <View
              style={styles.loginRow}
            >
              <Text
                style={styles.loginText}
              >
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.replace(
                    "/seeker-login"
                  )
                }
              >
                <Text
                  style={styles.loginLink}
                >
                  {" "}
                  Sign in
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
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -130,
    right: -120,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 20,
    left: -150,
    backgroundColor: "#F5F3FF",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
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
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F1EFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    marginTop: 20,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
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
    maxWidth: 340,
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
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  sectionStep: {
    fontSize: 11,
    fontWeight: "800",
    color: "#635BFF",
    backgroundColor: "#F1EFFF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
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
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 2,
    fontSize: 11,
    color: "#98A2B3",
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#EEF0F4",
    marginVertical: 6,
    marginBottom: 20,
  },

  createButton: {
    height: 60,
    marginTop: 6,
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
    fontSize: 16,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    fontSize: 14,
    color: "#667085",
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "800",
    color: "#635BFF",
  },
});