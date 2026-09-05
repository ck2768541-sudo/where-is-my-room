import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import OwnerBottomNav from "../components/OwnerBottomNav";

export default function OwnerActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          ACTIVITY
        </Text>

        <Text style={styles.title}>
          Your activity
        </Text>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons
              name="notifications-outline"
              size={34}
              color="#635BFF"
            />
          </View>

          <Text style={styles.cardTitle}>
            No activity yet
          </Text>

          <Text style={styles.cardText}>
            Property enquiries and important
            updates will appear here in future.
          </Text>
        </View>
      </View>

      <OwnerBottomNav />
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
    top: -125,
    right: -125,
    backgroundColor: "#F1EFFF",
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 70,
    left: -155,
    backgroundColor: "#F5F3FF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 110,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#635BFF",
  },

  title: {
    marginTop: 5,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: "#111827",
  },

  card: {
    marginTop: 28,
    paddingVertical: 38,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },

  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  cardTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  cardText: {
    marginTop: 8,
    maxWidth: 250,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    color: "#98A2B3",
  },
});