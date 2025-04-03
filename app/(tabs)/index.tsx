import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnamPlayerComponent } from "../../components/AnamPlayer";

export default function Home() {
  const [showVideo, setShowVideo] = useState(true);

  // API key here for testing, in production make a request to your server which will then return a session token
  // See: https://docs.anam.ai/guides/get-started/production for more information
  const API_KEY = "YOUR_API_KEY";

  /**
   * In a production use case you would define your persona on the server side when fetching a session token.
   * The session token includes a reference to your persona config, so no details such as system prompt need to shared with the client.
   *
   * Options for defining your persona
   *
   * 1. You can keep a constant persona ID. You can create your persona in the Anam Lab and then use the ID here.
   *
   * 2. You can define your persona programmatically.
   *
   * personaConfig: {
   *   name: "Cara",
   *   avatarId: "30fa96d0-26c4-4e55-94a0-517025942e18", // The avatar ID for Cara
   *   voiceId: "6bfbe25a-979d-40f3-a92b-5394170af54b", // The voice ID for Cara
   *   brainType: "ANAM_LLAMA_v3_3_70B_V1",
   *   systemPrompt: "[STYLE] Reply in natural speech without formatting. Add pauses using '...' and very occasionally a disfluency. [PERSONALITY] You are Cara, a helpful assistant.",
   * },
   *
   * 3. You can pass user specific information to your server when fetching a session token which can build the persona config dynamically.
   */
  const PERSONA_CONFIG = {
    name: "Cara",
    avatarId: "30fa96d0-26c4-4e55-94a0-517025942e18", // The avatar ID for Cara
    voiceId: "6bfbe25a-979d-40f3-a92b-5394170af54b", // The voice ID for Cara
    brainType: "ANAM_LLAMA_v3_3_70B_V1",
    systemPrompt:
      "[STYLE] Reply in natural speech without formatting. Add pauses using '...' and very occasionally a disfluency. The user expects you to start the interaction. [PERSONALITY] You are Cara, a helpful assistant.",
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
              onDisconnected={() => {
                console.log("Disconnected!");
                setShowVideo(false);
              }}
              onError={(error) => console.error("Error:", error)}
            />
          </View>
        )}
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
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
