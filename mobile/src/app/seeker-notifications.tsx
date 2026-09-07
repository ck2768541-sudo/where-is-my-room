import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "../utils/authStorage";

type NotificationType =
  | "support"
  | "property"
  | "favorite"
  | "account"
  | "general";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string | null;
  createdAt: string;
};

export default function SeekerNotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to load notifications."
        );
        return;
      }

      setNotifications(
        Array.isArray(data?.notifications)
          ? data.notifications
          : []
      );

      setUnreadCount(
        Number(data?.unreadCount) || 0
      );
    } catch (error) {
      console.error(
        "Seeker notifications error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const markAsRead = async (
    notificationId: string
  ) => {
    try {
      const notification =
        notifications.find(
          (item) =>
            item._id === notificationId
        );

      if (!notification || notification.isRead) {
        return;
      }

      const token = await getAuthToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      if (unreadCount === 0) {
        return;
      }

      setMarkingAll(true);

      const token = await getAuthToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to update",
          data?.message ||
            "Could not mark notifications as read."
        );
        return;
      }

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      Alert.alert(
        "Network Error",
        "Unable to connect to the server."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const getIconName = (
    type: NotificationType
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "support":
        return "headset-outline";

      case "property":
        return "home-outline";

      case "favorite":
        return "heart-outline";

      case "account":
        return "person-outline";

      default:
        return "notifications-outline";
    }
  };

  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
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

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>
              STAYRENT
            </Text>

            <Text style={styles.title}>
              Notifications
            </Text>
          </View>

          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="notifications-outline"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Stay updated
            </Text>

            <Text style={styles.heroText}>
              Important support, property and
              account updates will appear here.
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionEyebrow}>
              RECENT
            </Text>

            <Text style={styles.sectionTitle}>
              Your notifications
            </Text>
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity
              style={styles.markAllButton}
              activeOpacity={0.8}
              disabled={markingAll}
              onPress={markAllAsRead}
            >
              {markingAll ? (
                <ActivityIndicator
                  size="small"
                  color="#635BFF"
                />
              ) : (
                <Text style={styles.markAllText}>
                  Mark all read
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="small"
              color="#635BFF"
            />

            <Text style={styles.stateTitle}>
              Loading notifications
            </Text>

            <Text style={styles.stateText}>
              Please wait a moment.
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateCard}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color="#F04438"
              />
            </View>

            <Text style={styles.stateTitle}>
              Unable to load notifications
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.85}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading &&
        !error &&
        notifications.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={26}
                color="#635BFF"
              />
            </View>

            <Text style={styles.stateTitle}>
              No notifications yet
            </Text>

            <Text style={styles.stateText}>
              New StayRent updates will appear
              here.
            </Text>
          </View>
        ) : null}

        {!loading &&
        !error &&
        notifications.length > 0
          ? notifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                style={[
                  styles.notificationCard,
                  !notification.isRead &&
                    styles.unreadCard,
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  markAsRead(notification._id)
                }
              >
                <View
                  style={[
                    styles.notificationIcon,
                    !notification.isRead &&
                      styles.unreadIcon,
                  ]}
                >
                  <Ionicons
                    name={getIconName(
                      notification.type
                    )}
                    size={21}
                    color="#635BFF"
                  />
                </View>

                <View
                  style={
                    styles.notificationContent
                  }
                >
                  <View
                    style={
                      styles.notificationTopRow
                    }
                  >
                    <Text
                      style={
                        styles.notificationTitle
                      }
                    >
                      {notification.title}
                    </Text>

                    {!notification.isRead ? (
                      <View
                        style={styles.unreadDot}
                      />
                    ) : null}
                  </View>

                  <Text
                    style={
                      styles.notificationMessage
                    }
                  >
                    {notification.message}
                  </Text>

                  <Text
                    style={
                      styles.notificationDate
                    }
                  >
                    {formatDate(
                      notification.createdAt
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          : null}
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

  headerCopy: {
    flex: 1,
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

  unreadBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F04438",
  },

  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#111827",
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#635BFF",
  },

  heroCopy: {
    flex: 1,
    marginLeft: 14,
  },

  heroTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: "#C7CDD8",
  },

  sectionRow: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#635BFF",
  },

  sectionTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  markAllButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  markAllText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#635BFF",
  },

  stateCard: {
    padding: 28,
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1EFFF",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F0",
  },

  stateTitle: {
    marginTop: 13,
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  stateText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#98A2B3",
  },

  errorText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#F04438",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: "#635BFF",
  },

  retryText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  notificationCard: {
    marginBottom: 10,
    padding: 15,
    flexDirection: "row",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },

  unreadCard: {
    backgroundColor: "#F8F7FF",
    borderColor: "#D9D6FE",
  },

  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F3FF",
  },

  unreadIcon: {
    backgroundColor: "#EEEAFE",
  },

  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },

  notificationTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },

  unreadDot: {
    width: 8,
    height: 8,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: "#F04438",
  },

  notificationMessage: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: "#667085",
  },

  notificationDate: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: "600",
    color: "#98A2B3",
  },
});
