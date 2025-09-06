import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const {width,height} = Dimensions.get("window");

const styles = StyleSheet.create({
  text: { color: Colors.white },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:"transparent",
  },
  bgContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)", // Optional: dark overlay for contrast
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: Colors.background,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
  },
  headerTitle: {
    fontFamily: "JetBrainMono-Medium",
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  imageContainer: {
    paddingVertical:12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    height:300,

  },
  imageContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: height*0.6, 
    marginBottom: 20,
  },

  imageWrapper: {
    alignItems: "center",
    marginHorizontal: 8,
    width: "100%",
    height: "100%", // ✅ This now works because the parent has a height
  },

  image: {
    width: "100%", // ✅ Image takes full width
    height: "100%", // ✅ Image takes full height
    resizeMode: "cover", // ✅ Ensures it covers the container properly
  },

  textArea: {
    width: "90%",
    alignSelf: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    marginVertical: 20,
    minHeight: 120,
  },
  changeImageButt: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
  },
 
  brandSection: {
    alignItems: "center",
    margin: height * 0.12,
  },
  logoContainer: {
    width:60,height:60,borderRadius:18,backgroundColor:"rgba(74,222,128,0.15)",justifyContent:"center",alignItems:"center",marginBottom:20
  },
  appName: {
    fontSize:42,
    textTransform:"uppercase",
    color:Colors.primary,
    fontFamily:"JetBrainMono-Bold",
  },
  tagLine: {
    fontSize:22,
    textAlign:"center",
    marginTop:10,
    color:Colors.white,
    fontFamily:"JetBrainMono-Medium",
  },
  loginGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },

  loginText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "JetBrainMono-Medium",
    marginLeft: 10,
  },

  loginLogo: {
    width: 22,
    height: 22,
  },
  input: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderColor: Colors.gray,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "JetBrainMono-Regular",
    color: Colors.textDark, // <- define if needed
  },
});

export default styles; // ✅ Ensure styles are exported properly
