import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>StayRent</Text>

        <Text style={styles.title}>How will you use the app?</Text>

        <Text style={styles.subtitle}>
          Choose an option to continue.
        </Text>

        <TouchableOpacity
          style={styles.primaryCard}
          activeOpacity={0.85}
          onPress={() => router.push("/seeker-login")}
        >
          <Text style={styles.primaryCardTitle}>Find a Room</Text>

          <Text style={styles.primaryCardText}>
            Search rooms, PGs and rental spaces near your preferred location.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCard}
          activeOpacity={0.85}
          onPress={() => router.push("/owner-login")}
        >
          <Text style={styles.secondaryCardTitle}>List My Property</Text>

          <Text style={styles.secondaryCardText}>
            Add your property and connect with people searching for a room.
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
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    lineHeight: 40,
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

  primaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },

  primaryCardTitle: {
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: "700",
  },

  primaryCardText: {
    color: COLORS.surface,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  secondaryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 22,
  },

  secondaryCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  secondaryCardText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
});