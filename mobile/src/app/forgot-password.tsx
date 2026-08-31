import { useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to send OTP",
          data.message || "Please try again."
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
                pathname: "/verify-reset-otp",
                params: {
                  email: email.trim().toLowerCase(),
                },
              }),
          },
        ]
      );
    } catch (error) {
      console.error("Forgot password request error:", error);

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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.brand}>
            Where Is My Room
          </Text>

          <Text style={styles.title}>
            Forgot password?
          </Text>

          <Text style={styles.subtitle}>
            Enter your registered email and we will send you a 6-digit OTP.
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.buttonText}>
                Send OTP
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
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

  input: {
    height: 54,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
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