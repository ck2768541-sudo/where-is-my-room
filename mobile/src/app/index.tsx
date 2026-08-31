import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";

export default function HomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/role-select");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Where Is My Room</Text>

        <Text style={styles.title}>
          Find the right room near you
        </Text>

        <Text style={styles.subtitle}>
          Discover available rooms, PGs and rental spaces near your preferred
          location.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
    marginBottom: 20,
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 44,
  },

  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    marginTop: 16,
    lineHeight: 26,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 32,
  },

  buttonText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "700",
  },
});