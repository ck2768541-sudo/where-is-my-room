import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SeekerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      if (pathname === "/seeker-home") {
        BackHandler.exitApp();
        return true;
      }

      if (
        pathname === "/seeker-map" ||
        pathname === "/seeker-favorites" ||
        pathname === "/seeker-profile"
      ) {
        router.replace("/seeker-home" as any);
        return true;
      }

      return false;
    };

    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

    return () => {
      subscription.remove();
    };
  }, [pathname, router]);

  const goTo = (route: string) => {
    if (pathname !== route) {
      router.replace(route as any);
    }
  };

  const isActive = (route: string) =>
    pathname === route;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/seeker-home")
          }
        >
          <Ionicons
            name={
              isActive("/seeker-home")
                ? "home"
                : "home-outline"
            }
            size={22}
            color={
              isActive("/seeker-home")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/seeker-home") &&
                styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* MAP */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/seeker-map")
          }
        >
          <Ionicons
            name={
              isActive("/seeker-map")
                ? "map"
                : "map-outline"
            }
            size={22}
            color={
              isActive("/seeker-map")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/seeker-map") &&
                styles.navTextActive,
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>

        {/* CENTER SEARCH */}
        <View style={styles.centerSpace}>
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.9}
            onPress={() =>
              goTo("/seeker-home")
            }
          >
            <Ionicons
              name="search"
              size={27}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* SAVED */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/seeker-favorites")
          }
        >
          <Ionicons
            name={
              isActive("/seeker-favorites")
                ? "heart"
                : "heart-outline"
            }
            size={22}
            color={
              isActive("/seeker-favorites")
                ? "#F04438"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/seeker-favorites") &&
                styles.savedTextActive,
            ]}
          >
            Saved
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/seeker-profile")
          }
        >
          <Ionicons
            name={
              isActive("/seeker-profile")
                ? "person"
                : "person-outline"
            }
            size={22}
            color={
              isActive("/seeker-profile")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/seeker-profile") &&
                styles.navTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,

    zIndex: 999,
    elevation: 20,
  },

  container: {
    height: 74,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 4,

    borderRadius: 24,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#EAECF0",

    shadowColor: "#101828",
    shadowOpacity: 0.12,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 14,
  },

  navItem: {
    width: "18%",
    height: "100%",

    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    marginTop: 4,

    fontSize: 8,
    fontWeight: "700",

    color: "#98A2B3",
  },

  navTextActive: {
    color: "#635BFF",
  },

  savedTextActive: {
    color: "#F04438",
  },

  centerSpace: {
    width: "20%",
    height: "100%",

    alignItems: "center",
    justifyContent: "flex-start",
  },

  searchButton: {
    width: 56,
    height: 56,

    marginTop: -25,

    borderRadius: 19,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#635BFF",

    borderWidth: 5,
    borderColor: "#F8F9FD",

    shadowColor: "#635BFF",
    shadowOpacity: 0.28,
    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 10,
  },
});