import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AnamPlayerComponent } from "../../components/AnamPlayer";

export default function Explore() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      text: string;
      sender: "user" | "ai";
      timestamp: Date;
    }>
  >([]);
  const [showVideo, setShowVideo] = useState(true);

  // Your API key or session token would go here
  const API_KEY = "your-api-key-here";
  const SESSION_TOKEN = undefined; // Optional: you can use this instead of API key

  // Example persona configuration - adjust based on your Anam AI setup
  const PERSONA_CONFIG = {
    personaId: "your-persona-id", // If using a saved persona
    // Or for custom persona:
    // name: 'Assistant',
    // appearance: {
    //   voiceId: 'en-US-neural2-J',
    //   avatarId: 'default-avatar'
    // }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add message to chat
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    // In a real app, you would send this to your AnamClient instance
    // anamClient.talk(message);

    // Clear input
    setMessage("");
  };

  const toggleVideoDisplay = () => {
    setShowVideo(!showVideo);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anam AI Demo</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleVideoDisplay}
        >
          <Text style={styles.toggleButtonText}>
            {showVideo ? "Hide Video" : "Show Video"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {showVideo && (
          <View style={styles.videoContainer}>
            <AnamPlayerComponent
              apiKey={API_KEY}
              personaConfig={PERSONA_CONFIG}
              style={styles.video}
              onConnected={() => console.log("Connected!")}
              onDisconnected={() => console.log("Disconnected")}
              onError={(error) => console.error("Error:", error)}
            />
          </View>
        )}

        <View style={styles.chatContainer}>
          <ScrollView style={styles.messagesContainer}>
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === "user"
                    ? styles.userMessageBubble
                    : styles.aiMessageBubble,
                ]}
              >
                <Text style={styles.messageTextStyle}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputContainerStyle}
          >
            <TextInput
              style={styles.inputStyle}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity
              style={styles.sendButtonStyle}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendButtonTextStyle}>Send</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2196F3",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  toggleButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    flexDirection: "column",
  },
  videoContainer: {
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  video: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    flexDirection: "column",
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessageBubble: {
    backgroundColor: "#E0F2F1",
    alignSelf: "flex-end",
  },
  aiMessageBubble: {
    backgroundColor: "#BBDEFB",
    alignSelf: "flex-start",
  },
  messageTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  inputContainerStyle: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  inputStyle: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 8,
  },
  sendButtonStyle: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
  },
  sendButtonTextStyle: {
    color: "white",
    fontWeight: "bold",
  },
});
