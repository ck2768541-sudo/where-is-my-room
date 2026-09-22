import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  useWindowDimensions,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";

export default function VerifyResetOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 380 || height < 700;
  const horizontalPadding =
    width < 380 ? 16 : width < 430 ? 20 : 24;
  const contentMaxWidth = 520;

  const email =
    typeof params.email === "string"
      ? params.email
      : "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [resendSeconds, setResendSeconds] =
    useState(45);

  const [secondsLeft, setSecondsLeft] =
    useState(5 * 60);

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

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(
        (current) =>
          current > 0
            ? current - 1
            : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendSeconds((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [resendSeconds]);

  const formattedTime = `${Math.floor(
    secondsLeft / 60
  )
    .toString()
    .padStart(2, "0")}:${(
    secondsLeft % 60
  )
    .toString()
    .padStart(2, "0")}`;

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

  const handleOpenGmail = async () => {
    try {
      const gmailUrl = "googlegmail://";

      const canOpenGmail =
        await Linking.canOpenURL(gmailUrl);

      if (canOpenGmail) {
        await Linking.openURL(gmailUrl);
        return;
      }

      await Linking.openURL("mailto:");
    } catch (error) {
      console.error(
        "Open Gmail error:",
        error
      );

      Alert.alert(
        "Open your email",
        "Please open Gmail or your email app and check your inbox and spam folder."
      );
    }
  };

  const handleResendOTP = async () => {
    if (resending || resendSeconds > 0 || !email) {
      return;
    }

    try {
      setResending(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to resend OTP",
          data?.message ||
            "Please try again."
        );
        return;
      }

      setOtp("");
      setSecondsLeft(5 * 60);
      setResendSeconds(45);

      Alert.alert(
        "OTP sent again",
        "A new 6-digit OTP has been sent to your email."
      );
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      Alert.alert(
        "Connection error",
        "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: isSmallScreen ? 12 : 18,
              paddingBottom: isSmallScreen ? 20 : 28,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                maxWidth: contentMaxWidth,
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

        <View
          style={[
            styles.hero,
            {
              marginTop: isSmallScreen ? 24 : 36,
            },
          ]}
        >
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

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
            ]}
          >
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

          <View style={styles.sentCard}>
            <View style={styles.sentIcon}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#12B76A"
              />
            </View>

            <View style={styles.sentCopy}>
              <Text style={styles.sentTitle}>
                OTP sent successfully
              </Text>

              <Text style={styles.sentText}>
                Check your Gmail inbox. If you do not see it, check Spam or Promotions.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.openGmailButton}
            activeOpacity={0.85}
            onPress={handleOpenGmail}
          >
            <Ionicons
              name="mail-open-outline"
              size={18}
              color="#635BFF"
            />

            <Text style={styles.openGmailText}>
              Open Gmail
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.formCard,
            isSmallScreen && styles.formCardSmall,
          ]}
        >
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
              {secondsLeft > 0
                ? `OTP expires in ${formattedTime}`
                : "OTP expired. Go back and request a new OTP."}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.resendButton,
              (resendSeconds > 0 || resending) &&
                styles.resendButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={resendSeconds > 0 || resending}
            onPress={handleResendOTP}
          >
            {resending ? (
              <ActivityIndicator
                size="small"
                color="#635BFF"
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={17}
                color={
                  resendSeconds > 0
                    ? "#98A2B3"
                    : "#635BFF"
                }
              />
            )}

            <Text
              style={[
                styles.resendText,
                resendSeconds > 0 &&
                  styles.resendTextDisabled,
              ]}
            >
              {resendSeconds > 0
                ? `Resend OTP in ${resendSeconds}s`
                : "Resend OTP"}
            </Text>
          </TouchableOpacity>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
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
    width: "100%",
    alignSelf: "center",
  },

  header: {
    width: "100%",
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
    width: "100%",
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

  titleSmall: {
    fontSize: 29,
    lineHeight: 35,
    letterSpacing: -0.8,
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
    flexShrink: 1,
    marginLeft: 6,
    maxWidth: 280,
    fontSize: 12,
    fontWeight: "700",
    color: "#475467",
  },

  sentCard: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#ABEFC6",
  },

  sentIcon: {
    marginTop: 1,
  },

  sentCopy: {
    flex: 1,
    marginLeft: 9,
  },

  sentTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#027A48",
  },

  sentText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#667085",
  },

  openGmailButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#F1EFFF",
  },

  openGmailText: {
    marginLeft: 7,
    fontSize: 11,
    fontWeight: "800",
    color: "#635BFF",
  },

  formCard: {
    width: "100%",
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

  formCardSmall: {
    marginTop: 22,
    padding: 16,
    borderRadius: 22,
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
    minWidth: 0,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 6,
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

  resendButton: {
    minHeight: 46,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    backgroundColor: "#F8F7FF",
  },

  resendButtonDisabled: {
    borderColor: "#E4E7EC",
    backgroundColor: "#F9FAFB",
  },

  resendText: {
    marginLeft: 7,
    fontSize: 11,
    fontWeight: "800",
    color: "#635BFF",
  },

  resendTextDisabled: {
    color: "#98A2B3",
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