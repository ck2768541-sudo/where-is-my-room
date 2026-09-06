import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "../utils/authStorage";

type ProblemType =
  | "account"
  | "property"
  | "payment"
  | "technical"
  | "other";

const SUPPORT_PHONE = "+916202969445";
const SUPPORT_WHATSAPP = "916202969445";
const SUPPORT_EMAIL = "stayrentofficial@gmail.com";

const problemOptions: {
  label: string;
  value: ProblemType;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: "Account",
    value: "account",
    icon: "person-outline",
  },
  {
    label: "Property",
    value: "property",
    icon: "home-outline",
  },
  {
    label: "Payment",
    value: "payment",
    icon: "card-outline",
  },
  {
    label: "Technical",
    value: "technical",
    icon: "construct-outline",
  },
  {
    label: "Other",
    value: "other",
    icon: "help-circle-outline",
  },
];

export default function OwnerSupportScreen() {
  const router = useRouter();

  const [problemType, setProblemType] =
    useState<ProblemType>("technical");

  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    try {
      if (!message.trim()) {
        Alert.alert(
          "Message required",
          "Please describe your problem."
        );
        return;
      }

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );
        return;
      }

      setSubmitting(true);

      const response = await fetch(
        `${API_BASE_URL}/support`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            problemType,
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Request failed",
          data?.message ||
            "Unable to submit support request."
        );
        return;
      }

      setMessage("");

      Alert.alert(
        "Request Submitted",
        "Your support request has been sent to StayRent support.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Owner support error:",
        error
      );

      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const text = encodeURIComponent(
        "Hello StayRent Support, I need help with my owner account."
      );

      const url =
        `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`;

      await Linking.openURL(url);
    } catch (error) {
      console.error(
        "WhatsApp support error:",
        error
      );

      Alert.alert(
        "Unable to open WhatsApp",
        "Please try again or use another support option."
      );
    }
  };

  const handleCall = async () => {
    try {
      await Linking.openURL(
        `tel:${SUPPORT_PHONE}`
      );
    } catch (error) {
      console.error(
        "Call support error:",
        error
      );

      Alert.alert(
        "Unable to call",
        `Please call ${SUPPORT_PHONE} manually.`
      );
    }
  };

  const handleEmail = async () => {
    try {
      const subject = encodeURIComponent(
        "StayRent Owner Support"
      );

      const body = encodeURIComponent(
        "Hello StayRent Support,\n\nI need help with my owner account.\n\nProblem:"
      );

      const url =
        `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

      await Linking.openURL(url);
    } catch (error) {
      console.error(
        "Email support error:",
        error
      );

      Alert.alert(
        "Unable to open email",
        `Please email us at ${SUPPORT_EMAIL}.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#111827"
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              SUPPORT
            </Text>

            <Text style={styles.title}>
              Help & Support
            </Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="headset-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.heroTitle}>
            How can we help?
          </Text>

          <Text style={styles.heroText}>
            Submit a support request or
            contact StayRent directly by
            WhatsApp, call, or email.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Contact us directly
        </Text>

        <View style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactRow}
            activeOpacity={0.85}
            onPress={handleWhatsApp}
          >
            <View
              style={[
                styles.contactIcon,
                styles.whatsappIcon,
              ]}
            >
              <Ionicons
                name="logo-whatsapp"
                size={22}
                color="#12B76A"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>
                WhatsApp Support
              </Text>

              <Text style={styles.contactText}>
                Fast response for quick help
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#98A2B3"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.contactRow}
            activeOpacity={0.85}
            onPress={handleCall}
          >
            <View
              style={[
                styles.contactIcon,
                styles.callIcon,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={21}
                color="#1570EF"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>
                Call Support
              </Text>

              <Text style={styles.contactText}>
                For urgent issues
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#98A2B3"
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.contactRow}
            activeOpacity={0.85}
            onPress={handleEmail}
          >
            <View
              style={[
                styles.contactIcon,
                styles.emailIcon,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={21}
                color="#F79009"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>
                Email Support
              </Text>

              <Text
                style={styles.contactText}
                numberOfLines={1}
              >
                {SUPPORT_EMAIL}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#98A2B3"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Submit support request
        </Text>

        <Text style={styles.fieldLabel}>
          Select problem type
        </Text>

        <View style={styles.optionsWrap}>
          {problemOptions.map((option) => {
            const selected =
              problemType === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  selected &&
                    styles.optionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  setProblemType(option.value)
                }
              >
                <Ionicons
                  name={option.icon}
                  size={19}
                  color={
                    selected
                      ? "#635BFF"
                      : "#667085"
                  }
                />

                <Text
                  style={[
                    styles.optionText,
                    selected &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>
          Describe your problem
        </Text>

        <TextInput
          style={styles.messageInput}
          placeholder="Example: I am unable to update my property..."
          placeholderTextColor="#98A2B3"
          multiline
          maxLength={1000}
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />

        <Text style={styles.counterText}>
          {message.length}/1000
        </Text>

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting &&
              styles.submitButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="send-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.submitText}>
                Submit Support Request
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  headerText: {
    marginLeft: 12,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#635BFF",
  },

  title: {
    marginTop: 3,
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  heroCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 26,
    backgroundColor: "#111827",
  },

  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
  },

  heroTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#C7CDD8",
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 11,
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  contactCard: {
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  contactRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
  },

  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  whatsappIcon: {
    backgroundColor: "#ECFDF3",
  },

  callIcon: {
    backgroundColor: "#EFF8FF",
  },

  emailIcon: {
    backgroundColor: "#FFFAEB",
  },

  contactContent: {
    flex: 1,
    marginLeft: 12,
  },

  contactTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  contactText: {
    marginTop: 4,
    fontSize: 10,
    color: "#98A2B3",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F1F4",
  },

  fieldLabel: {
    marginTop: 16,
    marginBottom: 11,
    fontSize: 13,
    fontWeight: "800",
    color: "#344054",
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  optionSelected: {
    backgroundColor: "#F1EFFF",
    borderColor: "#C7C2FF",
  },

  optionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
  },

  optionTextSelected: {
    color: "#635BFF",
  },

  messageInput: {
    minHeight: 150,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    fontSize: 13,
    lineHeight: 20,
    color: "#111827",
  },

  counterText: {
    marginTop: 7,
    textAlign: "right",
    fontSize: 10,
    color: "#98A2B3",
  },

  submitButton: {
    height: 58,
    marginTop: 24,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#635BFF",
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
