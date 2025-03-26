import { AnamClient, createClient, PersonaConfig } from "@anam-ai/js-sdk";
import { AnamEvent } from "@anam-ai/js-sdk/dist/module/types";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RTCView } from "react-native-webrtc";
interface AnamPlayerComponentProps {
  // Authentication options
  apiKey?: string;
  // Persona configuration
  personaConfig?: PersonaConfig;
  // Appearance
  style?: any;
  // Events
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  // Controls visibility
  showControls?: boolean;
  // Additional options
  clientOptions?: any;
}

export const AnamPlayerComponent: React.FC<AnamPlayerComponentProps> = ({
  apiKey,
  personaConfig,
  style,
  onConnected,
  onDisconnected,
  onError,
  showControls = true,
  clientOptions,
}) => {
  // State
  const [videoStream, setVideoStream] = useState<any>(null);
  const [audioStream, setAudioStream] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const clientRef = useRef<AnamClient | null>(null);

  // Request permissions (Android only)
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error("Error requesting permissions:", error);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  // Initialize the client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        // Request permissions first
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
          setErrorMessage("Camera and microphone permissions are required");
          return;
        }
        // check that persona config has an ID
        if (!(personaConfig as any).personaId) {
          setErrorMessage("Persona ID is required");
          return;
        }

        setIsConnecting(true);
        setErrorMessage(null);

        // get session token
        const response = await fetch(
          "https://api.anam.ai/v1/auth/session-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              personaConfig: {
                id: (personaConfig as any).personaId,
              },
            }),
          }
        );
        const data = await response.json();
        const sessionToken = data.sessionToken;

        // Create client
        clientRef.current = createClient(sessionToken);

        // Set up event listeners
        clientRef.current.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
          setIsConnected(true);
          setIsConnecting(false);
          if (onConnected) onConnected();
        });

        clientRef.current.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          setIsConnected(false);
          setIsConnecting(false);
          if (onDisconnected) onDisconnected();
        });

        // Start streaming
        await clientRef.current.streamToReactNativeElements(
          (stream: any) => setVideoStream(stream),
          (stream: any) => setAudioStream(stream)
        );
      } catch (error) {
        setIsConnecting(false);
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        if (onError && error instanceof Error) onError(error);
      }
    };

    initializeClient();

    // Clean up on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.stopStreaming();
      }
    };
  }, [apiKey, personaConfig]);

  // Handle mute toggle
  const toggleMute = () => {
    if (!clientRef.current) return;

    if (isMuted) {
      clientRef.current.unmuteInputAudio();
    } else {
      clientRef.current.muteInputAudio();
    }

    setIsMuted(!isMuted);
  };

  // Handle camera switch
  const switchCamera = () => {
    if (!clientRef.current) return;

    // Call the switchCamera method if available
    (clientRef.current as any).switchCamera?.();
    setIsFrontCamera(!isFrontCamera);
  };

  // Handle disconnect
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.stopStreaming();
    }
  };

  // Send message to the AI
  const sendMessage = async (text: string) => {
    if (!clientRef.current) return;

    try {
      await clientRef.current.talk(text);
    } catch (error) {
      console.error("Failed to send message:", error);
      if (onError && error instanceof Error) onError(error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {isConnecting && !isConnected && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {videoStream && (
        <RTCView
          streamURL={videoStream.toURL()}
          style={styles.videoStream}
          objectFit="cover"
        />
      )}

      {showControls && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonDisabled,
            ]}
            onPress={toggleMute}
          >
            {/* <Icon
              name={isMuted ? "mic-off" : "mic"}
              size={24}
              color="#ffffff"
            /> */}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
            {/* <Icon name="flip-camera-ios" size={24} color="#ffffff" /> */}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={disconnect}
          >
            {/* <Icon name="call-end" size={24} color="#ffffff" /> */}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
  },
  videoStream: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
    padding: 20,
  },
  errorText: {
    color: "#ff0000",
    textAlign: "center",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  controlButtonDisabled: {
    backgroundColor: "rgba(255, 0, 0, 0.6)",
  },
  endCallButton: {
    backgroundColor: "#ff0000",
  },
});

export default AnamPlayerComponent;
