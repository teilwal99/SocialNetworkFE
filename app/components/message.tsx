import { Image, Text, View } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { styles } from "@/styles/profile.styles";

interface UserInfo {
    username: string | undefined;
    image: string | undefined;
  }
  
  interface Message {
    content: string;
    _creationTime: number;
    sender: UserInfo;
    receiver: UserInfo;
  }
  
  interface MessageProps {
    message: Message;
    currentUsername: string | undefined;
  }
  
export default function Message({ message,currentUsername }: MessageProps) {
    const isCurrentUser = message.sender.username === currentUsername;
    return (
        <View
            style={[
            styles.messageItem,
            { 
                direction: isCurrentUser ? "rtl" : "ltr",
            },
            ]}
        >
            <Image source={{ uri: message.sender.image }} style={styles.avatarMessage} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={styles.messageUsername}>{message.sender.username}</Text>
            <Text style={styles.messageText}>{message.content}</Text>
            <Text style={styles.messageTime}>
                {formatDistanceToNow(message._creationTime, { addSuffix: true })}
            </Text>
            </View>
        </View>
    );
}
