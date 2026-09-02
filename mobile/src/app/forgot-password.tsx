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

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
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

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Email required",
        "Please enter your registered email."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
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
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to send OTP",
          data.message ||
            "Please try again."
        );
        return;
      }

      Alert.alert(
        "OTP sent",
        "A 6-digit OTP has been sent to your email.",
        [
          {
            text: "Continue",
            onPress: () =>
              router.push({
                pathname:
                  "/verify-reset-otp",
                params: {
                  email: email
                    .trim()
                    .toLowerCase(),
                },
              }),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Forgot password request error:",
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
                name="key-outline"
                size={28}
                color="#635BFF"
              />
            </View>

            <Text style={styles.eyebrow}>
              ACCOUNT RECOVERY
            </Text>

            <Text style={styles.title}>
              Forgot your
              {"\n"}
              password?
            </Text>

            <Text style={styles.subtitle}>
              Enter your registered email.
              We’ll send you a 6-digit OTP
              to reset your password.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Recover your account
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
                placeholder="Enter your registered email"
                placeholderTextColor="#98A2B3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading &&
                  styles.buttonDisabled,
              ]}
              activeOpacity={0.9}
              onPress={handleSendOTP}
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
                      styles.buttonText
                    }
                  >
                    Send OTP
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

            <View style={styles.infoBox}>
              <Ionicons
                name="mail-unread-outline"
                size={18}
                color="#635BFF"
              />

              <Text style={styles.infoText}>
                Check your inbox after
                requesting the OTP.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backToLogin}
            activeOpacity={0.7}
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
              size={16}
              color="#635BFF"
            />

            <Text
              style={
                styles.backToLoginText
              }
            >
              Back to login
            </Text>
          </TouchableOpacity>
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
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
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
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  button: {
    height: 60,
    marginTop: 22,
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

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
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

  infoBox: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F7F5FF",
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    color: "#667085",
  },

  backToLogin: {
    alignSelf: "center",
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  backToLoginText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#635BFF",
  },
});