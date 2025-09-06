import { StyleSheet , Dimensions } from "react-native";
import { View } from "react-native";
import { Platform } from "react-native";
import { Colors } from "@/constants/Colors";

const {width,height} = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: Colors.primary,
  },
  storiesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  storyWrapper: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 72,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 4,
  },
  noStory: {
    borderColor: Colors.gray,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  storyUsername: {
    fontSize: 11,
    color: Colors.white,
    textAlign: "center",
  },
  post: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  postImage: {
    width: width - 16,
    marginHorizontal: 8,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  postActionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  postInfo: {
    paddingHorizontal: 12,
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: 6,
  },
  captionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  captionUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
    marginRight: 6,
  },
  captionText: {
    fontSize: 14,
    color: Colors.white,
    flex: 1,
  },
  commentsText: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
  },
  modalContainer: {
    backgroundColor: Colors.background,
    marginBottom: Platform.OS === "ios" ? 44 : 0,
    flex: 1,
    marginTop: Platform.OS === "ios" ? 44 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surface,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surface,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: Colors.white,
    fontWeight: "500",
    marginBottom: 4,
  },
  commentText: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surface,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    color: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    fontSize: 14,
  },
  postButton: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  
  bookmarkContainer: {
    width:"100%",
  },
  imageBookmark: {
    width: "50%",
    padding: 20,
    aspectRatio: 1,
    borderRadius: 6,
  },
});

export default styles; // ✅ Ensure styles are exported properly
