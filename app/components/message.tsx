import { Image, Text, View } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { styles } from "@/styles/profile.styles";
import { MessageCreateProps, MessageProps } from "../type/message";
import { useAuth } from "@/providers/AuthProvider";
  
export default function Message( props: { message: MessageProps , sender:any, receiver:any}) {
    const {user} = useAuth();
    const isCurrentUser = props.message.sender === props.sender.id;
    const imageUrl = isCurrentUser ? props.sender.profilePictureUrl : props.receiver.profilePictureUrl;
    
    return (
        <View
        style={[
            styles.messageItem,
            { flexDirection: isCurrentUser ? "row-reverse" : "row" },
        ]}
        >
        <Image source={{ uri: "http://localhost:8081" + imageUrl }} style={styles.avatarMessage} />
        <View
            style={{
            flex: 1,
            marginHorizontal: 10,
            alignItems: isCurrentUser ? "flex-end" : "flex-start", // 👈 text align
            }}
        >
            <Text style={styles.messageUsername}>
            {isCurrentUser ? props.sender.username : props.receiver.username}
            </Text>
            <Text style={styles.messageText}>{props.message.content}</Text>
            <Text style={styles.messageTime}>
            {formatDistanceToNow(props.message.timestamp, { addSuffix: true })}
            </Text>
        </View>
        </View>

    );
}
