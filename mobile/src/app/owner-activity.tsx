import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import OwnerBottomNav from "../components/OwnerBottomNav";

export default function OwnerActivityScreen() {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 380 || height < 700;
  const horizontalPadding =
    width < 360 ? 14 : width < 430 ? 18 : 20;
  const contentMaxWidth = 720;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallScreen ? 22 : 32,
          },
        ]}
      >
        <View
          style={[
            styles.pageContent,
            {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          <Text style={styles.eyebrow}>
            ACTIVITY
          </Text>

          <Text
            style={[
              styles.title,
              isSmallScreen && styles.titleSmall,
            ]}
          >
            Your activity
          </Text>

          <View
            style={[
              styles.card,
              isSmallScreen && styles.cardSmall,
            ]}
          >
            <View
              style={[
                styles.iconBox,
                isSmallScreen && styles.iconBoxSmall,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={isSmallScreen ? 30 : 34}
                color="#635BFF"
              />
            </View>

            <Text
              style={[
                styles.cardTitle,
                isSmallScreen && styles.cardTitleSmall,
              ]}
            >
              No activity yet
            </Text>

            <Text style={styles.cardText}>
              Property enquiries and important
              updates will appear here in future.
            </Text>
          </View>
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
    alignItems: "center",
    paddingBottom: 110,
  },

  pageContent: {
    width: "100%",
    alignSelf: "center",
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

  titleSmall: {
    fontSize: 23,
    letterSpacing: -0.5,
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

  cardSmall: {
    marginTop: 22,
    paddingVertical: 30,
    paddingHorizontal: 18,
    borderRadius: 22,
  },

  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  iconBoxSmall: {
    width: 62,
    height: 62,
    borderRadius: 21,
  },

  cardTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  cardTitleSmall: {
    fontSize: 16,
  },

  cardText: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    color: "#98A2B3",
  },
});
