// styles/notifications.styles.ts
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surface,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: Colors.primary,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: Colors.white ,
    color: Colors.white,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  iconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  notificationInfo: {
    flex: 1,
  },
  username: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  action: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 2,
  },
  timeAgo: {
    color: Colors.gray,
    fontSize: 12,
  },
  postImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});