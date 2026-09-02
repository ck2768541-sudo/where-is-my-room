import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";

export default function VerifyResetOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email =
    typeof params.email === "string"
      ? params.email
      : "";

  const [otp, setOtp] = useState("");
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

  const handleVerifyOTP = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/verify-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otp.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        Alert.alert(
          "Verification failed",
          data.message ||
            "Invalid OTP."
        );
        return;
      }

      router.push({
        pathname: "/reset-password",
        params: {
          email,
        },
      });
    } catch (error) {
      console.error(
        "OTP verify error:",
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

  const maskedEmail = email
    ? email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, start, middle, end) =>
          `${start}${"*".repeat(
            Math.min(
              middle.length,
              6
            )
          )}${end}`
      )
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FD"
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

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
    router.replace("/forgot-password");
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
              name="shield-checkmark-outline"
              size={29}
              color="#635BFF"
            />
          </View>

          <Text style={styles.eyebrow}>
            VERIFY YOUR IDENTITY
          </Text>

          <Text style={styles.title}>
            Enter the
            {"\n"}
            verification code.
          </Text>

          <Text style={styles.subtitle}>
            We sent a 6-digit OTP to
          </Text>

          <View style={styles.emailChip}>
            <Ionicons
              name="mail-outline"
              size={15}
              color="#635BFF"
            />

            <Text
              style={styles.emailText}
              numberOfLines={1}
            >
              {maskedEmail || email}
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            6-digit OTP
          </Text>

          <Text style={styles.formSubtitle}>
            Enter the code exactly as shown
            in your email.
          </Text>

          <View style={styles.otpBox}>
            <Ionicons
              name="keypad-outline"
              size={21}
              color="#98A2B3"
            />

            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#C4C7D0"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(value) =>
                setOtp(
                  value.replace(
                    /[^0-9]/g,
                    ""
                  )
                )
              }
            />

            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {otp.length}/6
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={handleVerifyOTP}
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
                  Verify OTP
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
              name="time-outline"
              size={18}
              color="#635BFF"
            />

            <Text style={styles.infoText}>
              If the code does not work,
              go back and request a new OTP.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.changeEmailButton}
          activeOpacity={0.7}
         onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/forgot-password");
  }
}}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color="#635BFF"
          />

          <Text
            style={
              styles.changeEmailText
            }
          >
            Change email
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
    fontSize: 14,
    lineHeight: 22,
    color: "#667085",
  },

  emailChip: {
    alignSelf: "flex-start",
    marginTop: 10,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  emailText: {
    marginLeft: 6,
    maxWidth: 250,
    fontSize: 12,
    fontWeight: "700",
    color: "#475467",
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
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  formSubtitle: {
    marginTop: 5,
    marginBottom: 18,
    fontSize: 12,
    lineHeight: 18,
    color: "#98A2B3",
  },

  otpBox: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#FBFCFE",
  },

  otpInput: {
    flex: 1,
    marginLeft: 11,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 8,
    color: "#111827",
  },

  counterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F1EFFF",
  },

  counterText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#635BFF",
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

  changeEmailButton: {
    alignSelf: "center",
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  changeEmailText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#635BFF",
  },
});