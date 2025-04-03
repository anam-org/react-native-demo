# Anam AI React Native Example 👋

The Anam AI [JavaScript SDK](https://www.npmjs.com/package/@anam-ai/js-sdk) is primarily a web SDK, but it can be used in a React Native app by combining it with the [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) library.

This example demonstrates how to use the Anam AI JavaScript SDK in a React Native app.

# Starting Template

This example is an [Expo](https://expo.dev) project that was initially created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).
In addition to the starting expo template the project includes:

- [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) for handling the WebRTC connection
- [Anam AI JavaScript SDK](https://www.npmjs.com/package/@anam-ai/js-sdk) for the AI interaction

Normally when developing with an Expo application on device you would run the Expo Go application on the device and connect to the local development server. However, as the react-native-webrtc library includes native code it is not supported on Expo Go by default. You can get things working by using the [expo-dev-client](https://docs.expo.dev/develop/development-builds/create-a-build/) to create a development build, which is essentially your own custom Expo Go application with native code ability.

If you're starting from your own Expo project you can follow the instructions in the Expo section of the [React Native WebRTC documentation](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/README.md).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. For testing purposes, update the API key in the `app/(tabs)/index.tsx` file.

3. Build a dev client and install it on your device or simulator by following the instructions in the [Expo documentation](https://docs.expo.dev/develop/development-builds/create-a-build/).

4. Start development server

   ```bash
    npx expo start
   ```

5. Open your dev client on your device or simulator and connect to the development server.

## Learn more

### Expo

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

### React Native WebRTC

To learn more about the react-native-webrtc library, look at the following resources:

- [React Native WebRTC GitHub](https://github.com/react-native-webrtc/react-native-webrtc).

### Anam AI JavaScript SDK

To learn more about the Anam AI JavaScript SDK, look at the following resources:

- [Anam AI JavaScript SDK](https://www.npmjs.com/package/@anam-ai/js-sdk).
- [Anam AI Documentation](https://docs.anam.ai).

## Not using Expo?

Expo isn't a requirement for using the Anam AI JavaScript SDK. You can use the SDK in any React Native project as long as you provide a WebRTC implementation.
In this example we're using the [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) library, and the important part is that you call [registerGlobals()](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/BasicUsage.md#registering-globals) before initializing the Anam SDK so that the browser API for WebRTC is available.
