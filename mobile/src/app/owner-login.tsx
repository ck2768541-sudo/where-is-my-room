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

import PasswordInput from "../components/PasswordInput";
import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { saveAuthSession } from "../utils/authStorage";

export default function OwnerLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Login failed",
          data.message || "Unable to login."
        );
        return;
      }

      if (data.user?.role !== "owner") {
        Alert.alert(
          "Wrong account type",
          "Please use an owner account on this login screen."
        );
        return;
      }

      await saveAuthSession(
        data.token,
        data.user
      );

     router.replace("/owner-properties");
    } catch (error) {
      console.error(
        "Owner login error:",
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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.content}>
          <Text style={styles.brand}>
            Where Is My Room
          </Text>

          <Text style={styles.title}>
            Owner Login
          </Text>

          <Text style={styles.subtitle}>
            Login to add and manage your rental properties.
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={
              COLORS.textSecondary
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>
            Password
          </Text>

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />

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
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={COLORS.surface}
              />
            ) : (
              <Text
                style={
                  styles.loginButtonText
                }
              >
                Login
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text
              style={styles.registerText}
            >
              Don't have an owner account?
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  "/owner-register"
                )
              }
            >
              <Text
                style={
                  styles.registerLink
                }
              >
                {" "}
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
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
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 20,
  },

  forgotText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },

  loginButton: {
    height: 54,
    backgroundColor:
      COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "700",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  registerText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  registerLink: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
});