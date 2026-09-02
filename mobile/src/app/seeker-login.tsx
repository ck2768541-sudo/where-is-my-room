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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { saveAuthSession } from "../utils/authStorage";

export default function SeekerLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing details",
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          "Login failed",
          data.message ||
            "Unable to login. Please try again."
        );
        return;
      }

      if (data.user?.role !== "seeker") {
        Alert.alert(
          "Wrong account type",
          "Please use a room seeker account on this login screen."
        );
        return;
      }

      await saveAuthSession(
        data.token,
        data.user
      );

      router.replace("/seeker-home");
    } catch (error) {
      console.error(
        "Login request error:",
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
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY:
                    slideAnim,
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
              <View
                style={styles.brandLogo}
              >
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
                name="search-outline"
                size={27}
                color="#635BFF"
              />
            </View>

            <Text style={styles.eyebrow}>
              WELCOME BACK
            </Text>

            <Text style={styles.title}>
              Find your next
              {"\n"}
              place to stay.
            </Text>

            <Text style={styles.subtitle}>
              Sign in to explore rooms,
              PGs and flats near your
              preferred location.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Sign in to StayRent
            </Text>

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
                placeholder="Enter your password"
                placeholderTextColor="#98A2B3"
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                activeOpacity={0.7}
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

            <TouchableOpacity
              style={styles.forgotButton}
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  "/forgot-password"
                )
              }
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.loginButtonDisabled,
              ]}
              activeOpacity={0.9}
              onPress={handleLogin}
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
                      styles.loginButtonText
                    }
                  >
                    Sign In
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
                Secure sign in with
                protected session storage
              </Text>
            </View>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              New to StayRent?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  "/seeker-register"
                )
              }
            >
              <Text style={styles.signupLink}>
                {" "}
                Create account
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    top: -120,
    right: -120,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    bottom: 20,
    left: -145,
    backgroundColor: "#F5F3FF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
    justifyContent: "center",
  },

  header: {
    position: "absolute",
    top: 18,
    left: 22,
    right: 22,
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
    marginTop: 70,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
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
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
    letterSpacing: -1.1,
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
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  formTitle: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
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

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 18,
  },

  forgotText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#635BFF",
  },

  loginButton: {
    height: 60,
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

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
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

  signupRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  signupText: {
    fontSize: 14,
    color: "#667085",
  },

  signupLink: {
    fontSize: 14,
    fontWeight: "800",
    color: "#635BFF",
  },
});
