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

export default function OwnerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const backAction = () => {
      if (pathname === "/owner-home") {
        BackHandler.exitApp();
        return true;
      }

      if (
        pathname === "/owner-properties" ||
        pathname === "/owner-activity" ||
        pathname === "/owner-profile"
      ) {
        router.replace("/owner-home" as any);
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
            goTo("/owner-home")
          }
        >
          <Ionicons
            name={
              isActive("/owner-home")
                ? "home"
                : "home-outline"
            }
            size={21}
            color={
              isActive("/owner-home")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/owner-home") &&
                styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* LISTINGS */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/owner-properties")
          }
        >
          <Ionicons
            name={
              isActive("/owner-properties")
                ? "business"
                : "business-outline"
            }
            size={21}
            color={
              isActive("/owner-properties")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/owner-properties") &&
                styles.navTextActive,
            ]}
          >
            Listings
          </Text>
        </TouchableOpacity>

        {/* CENTER ADD */}
        <View style={styles.centerSpace}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.9}
            onPress={() =>
              goTo("/owner-add-property")
            }
          >
            <Ionicons
              name="add"
              size={29}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* ACTIVITY */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/owner-activity")
          }
        >
          <Ionicons
            name={
              isActive("/owner-activity")
                ? "notifications"
                : "notifications-outline"
            }
            size={21}
            color={
              isActive("/owner-activity")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/owner-activity") &&
                styles.navTextActive,
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() =>
            goTo("/owner-profile")
          }
        >
          <Ionicons
            name={
              isActive("/owner-profile")
                ? "person"
                : "person-outline"
            }
            size={21}
            color={
              isActive("/owner-profile")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              isActive("/owner-profile") &&
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

  centerSpace: {
    width: "20%",

    height: "100%",

    alignItems: "center",
    justifyContent: "flex-start",
  },

  addButton: {
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