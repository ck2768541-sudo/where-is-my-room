import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function SeekerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const isTablet = width >= 768;

  const wrapperSide = isSmallScreen ? 8 : 10;
  const wrapperBottom = isSmallScreen ? 8 : 10;

  const containerHeight = isSmallScreen
    ? 68
    : isTablet
    ? 80
    : 74;

  const containerRadius = isSmallScreen
    ? 20
    : isTablet
    ? 28
    : 24;

  const containerPaddingHorizontal = isSmallScreen
    ? 2
    : isTablet
    ? 10
    : 4;

  const iconSize = isSmallScreen ? 20 : 22;
  const searchIconSize = isSmallScreen ? 24 : 27;

  const navTextSize = isSmallScreen ? 7 : 8;
  const navTextMarginTop = isSmallScreen ? 3 : 4;

  const searchButtonSize = isSmallScreen
    ? 50
    : isTablet
    ? 60
    : 56;

  const searchButtonRadius = isSmallScreen
    ? 17
    : isTablet
    ? 20
    : 19;

  const searchButtonLift = isSmallScreen ? -20 : -25;

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
     router.navigate("/seeker-home" as any);
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
    router.navigate(route as any);
  }
};

  const isActive = (route: string) =>
    pathname === route;
  return (
    <View
      style={[
        styles.wrapper,
        {
          left: wrapperSide,
          right: wrapperSide,
          bottom: wrapperBottom,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            height: containerHeight,
            borderRadius: containerRadius,
            paddingHorizontal: containerPaddingHorizontal,
            maxWidth: isTablet ? 520 : undefined,
            alignSelf: "center",
            width: "100%",
          },
        ]}
      >
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
            size={iconSize}
            color={
              isActive("/seeker-home")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              {
                fontSize: navTextSize,
                marginTop: navTextMarginTop,
              },
              isActive("/seeker-home") &&
                styles.navTextActive,
            ]}
            numberOfLines={1}
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
            size={iconSize}
            color={
              isActive("/seeker-map")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              {
                fontSize: navTextSize,
                marginTop: navTextMarginTop,
              },
              isActive("/seeker-map") &&
                styles.navTextActive,
            ]}
            numberOfLines={1}
          >
            Map
          </Text>
        </TouchableOpacity>

        {/* CENTER SEARCH */}
        <View style={styles.centerSpace}>
          <TouchableOpacity
            style={[
              styles.searchButton,
              {
                width: searchButtonSize,
                height: searchButtonSize,
                borderRadius: searchButtonRadius,
                marginTop: searchButtonLift,
              },
            ]}
            activeOpacity={0.9}
            onPress={() =>
              goTo("/seeker-home")
            }
          >
            <Ionicons
              name="search"
              size={searchIconSize}
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
            size={iconSize}
            color={
              isActive("/seeker-favorites")
                ? "#F04438"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              {
                fontSize: navTextSize,
                marginTop: navTextMarginTop,
              },
              isActive("/seeker-favorites") &&
                styles.savedTextActive,
            ]}
            numberOfLines={1}
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
            size={iconSize}
            color={
              isActive("/seeker-profile")
                ? "#635BFF"
                : "#98A2B3"
            }
          />

          <Text
            style={[
              styles.navText,
              {
                fontSize: navTextSize,
                marginTop: navTextMarginTop,
              },
              isActive("/seeker-profile") &&
                styles.navTextActive,
            ]}
            numberOfLines={1}
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
    zIndex: 999,
    elevation: 20,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

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
    flex: 1,
    height: "100%",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 2,
  },

  navText: {
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
    flex: 1.15,
    height: "100%",

    alignItems: "center",
    justifyContent: "flex-start",
  },

  searchButton: {
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