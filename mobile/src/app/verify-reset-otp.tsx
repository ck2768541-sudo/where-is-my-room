import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";

export default function VerifyResetOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email =
    typeof params.email === "string" ? params.email : "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Verification failed",
          data.message || "Invalid OTP."
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
      console.error("OTP verify error:", error);

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
      <View style={styles.content}>
        <Text style={styles.brand}>
          Where Is My Room
        </Text>

        <Text style={styles.title}>
          Verify OTP
        </Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to
          {"\n"}
          {email}
        </Text>

        <Text style={styles.label}>
          OTP
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(value) =>
            setOtp(value.replace(/[^0-9]/g, ""))
          }
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>
              Verify OTP
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Change Email
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 32,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  otpInput: {
    height: 58,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 8,
    color: COLORS.textPrimary,
    textAlign: "center",
  },

  button: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "700",
  },

  backButton: {
    alignItems: "center",
    marginTop: 22,
  },

  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
});