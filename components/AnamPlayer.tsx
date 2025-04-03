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
import {
  MediaStream as RNMediaStream,
  RTCView,
  mediaDevices,
  registerGlobals,
} from "react-native-webrtc";
import Feather from "@expo/vector-icons/Feather";

/**
 * This is required for the Anam AI JavaScript SDK to work in React Native.
 * It registers the global variables for the WebRTC API.
 * For more information see: https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/BasicUsage.md#registering-globals
 */
registerGlobals();

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
  const [startConnection, setStartConnection] = useState(false);
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

        /**
         * Set up the media stream input capture of the user's audio
         */
        const audioStream: RNMediaStream = await mediaDevices.getUserMedia({
          audio: true,
        });

        setIsConnecting(true);
        setErrorMessage(null);

        // get session token
        /**
         * This call would be handled by your server in a production use case.
         */
        const response = await fetch(
          "https://api.anam.ai/v1/auth/session-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              personaConfig,
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
          setVideoStream(null);
          if (onDisconnected) onDisconnected();
        });

        // Start streaming
        /**
         * It seems that the onaddtrack and onremovetrack event handlers are not defined on the RNMediaStream object
         * Looking at their source code, it looks like they should be defined in their implementation: https://github.com/react-native-webrtc/react-native-webrtc/blob/8035eb5067b472c2e60716a112d932ffe0c4dd85/src/MediaStream.ts#L155
         * However, as they are not working here we need to force a cast to the MDN MediaStream type
         */
        const outputStreams = await clientRef.current.stream(
          audioStream as unknown as MediaStream
        );
        const videoStream = outputStreams[0] as unknown as RNMediaStream; // we only need the video stream, it has the audio track too

        const audioTrack = videoStream.getAudioTracks()[0];
        audioTrack._setVolume(1); // control the volume of the audio track
        setVideoStream(videoStream);
      } catch (error) {
        setIsConnecting(false);
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        if (onError && error instanceof Error) onError(error);
      }
    };

    if (startConnection) {
      initializeClient();
    }

    // Clean up on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.stopStreaming();
      }
    };
  }, [apiKey, personaConfig, startConnection]);

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

  const onPressCallButton = () => {
    if (isConnecting || isConnected) {
      disconnect();
    } else {
      setStartConnection(true);
    }
  };

  // Handle disconnect
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.stopStreaming();
    }
    setVideoStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setStartConnection(false);
  };

  return (
    <View style={[styles.container, style]}>
      {isConnecting && !isConnected && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      )}

      {!isConnecting && !isConnected && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Press the call button to connect.
          </Text>
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
            <Feather
              name={isMuted ? "mic-off" : "mic"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              ...(isConnecting || isConnected
                ? [styles.endCallButton]
                : [styles.startCallButton]),
            ]}
            onPress={onPressCallButton}
          >
            <Feather name="phone" size={24} color="white" />
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
  startCallButton: {
    backgroundColor: "#00ff00",
  },
});

export default AnamPlayerComponent;
