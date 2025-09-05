// Import React Native core components
import {
  AppState,
  Dimensions,
  // Easing, // Trial and error: Alternative easing import
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Import React hooks and utilities
import { useEffect, useRef, useState } from "react";

// Import safe area handling
import { SafeAreaView } from "react-native-safe-area-context";

// Import UI components
import { LinearGradient } from "expo-linear-gradient";
import { Link, router, useFocusEffect } from "expo-router";

// Import file system utilities
import * as FileSystem from 'expo-file-system';

// Import notification utilities
import * as Burnt from "burnt";

// Import icons
import AntDesign from "@expo/vector-icons/AntDesign";

// Import device utilities
import { useBatteryLevel } from "expo-battery";

// Import animation utilities
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";

// Import location services
import * as Location from "expo-location";

// Import API utilities
import { api } from "@/axios";

// Import task management
import * as TaskManager from "expo-task-manager";

// Import brightness control
import * as Brightness from "expo-brightness";

// Import Firebase utilities
import { getDatabase, ref, set } from "firebase/database";
import { ref as storageRef, uploadBytes, uploadString } from 'firebase/storage'
import { app, storage } from "@/firebaseConfig";

// Import Redux utilities
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/apiCalls";

// Import authentication utilities
import { validateToken } from "../(auth)/permissions";

// Import context providers
import { useToast } from "@/context/ToastContext";
import React from "react";

// Import audio utilities
import { useAudioRecorder, RecordingOptions, AudioModule, RecordingPresets, useAudioPlayer } from 'expo-audio'
import axios from "axios";

// Import socket utilities
import { io } from "socket.io-client";

// Import location task utilities
import { startBackgroundLocation } from "@/locationTask";

// Import Camera utilities
import { Camera, CameraType } from "expo-camera";

export default function HomeScreen() {
  // State for emergency message input
  const [message, setMessage] = useState('')

  // Function to display messages
  const showMessage = (message: string) => {
    setMessage(message)
  }

  // Get window dimensions for responsive layout
  const windowHeight = Dimensions.get("window").height;
  
  // Audio recording states
  const [recordingURI, setRecordingURI] = useState<string | null>(null)
  const player = useAudioPlayer(recordingURI)
  
  // Socket connection states
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState('N/A')
  
  // Emergency states
  const [emergency, setEmergency] = useState(false);
  const [emergencyId, setEmergencyId] = useState();
  const intervalRef = useRef<number | null>(null)
  const [receivedEmergency, setReceivedEmergency] = useState(false);
  const [receivedEmergencies, setReceivedEmergencies] = useState<any[]>([]);
  const [toast, setToast] = useState(false);
  // const [mostRecentEmergency, setMostRecentEmergency] = useState(); // Trial and error: Alternative emergency tracking

  // Get battery level using expo-battery
  const batteryLevel = useBatteryLevel();
  
  // Location states
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redux state management
  const user = useSelector((state: RootState) =>
    state.user.currentUser
  );
  const isLoading = useSelector((state: RootState) =>
    state.user.isFetching === null ? null : state.user.isFetching
  );
  const errorMessage = useSelector((state: RootState) =>
    state.user.error === null ? null : state.user.error
  );
  
  // Toast context for notifications
  const { showToast } = useToast()
  const dispatch = useDispatch();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  // Camera states
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoURI, setVideoURI] = useState<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Initialize Firebase database
  const database = getDatabase(app);
  // const socket = io("http://192.168.1.200:5000", {auth: {token: user?.token}}) // Trial and error: Local development socket

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  // Request location permissions and get current location
  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    console.log(location);
    return location;
  };

  // Set system brightness to minimum for emergency situations
  const setBrightness = async () => {
    const { status } = await Brightness.requestPermissionsAsync();
    console.log(await Brightness.isAvailableAsync());
    if (status === "granted") {
      await Brightness.setSystemBrightnessAsync(0);
      const test = await Brightness.getBrightnessAsync();
      console.log(test);
    }
  };

  // Display toast notification for emergency alerts
  const displayToast = () => {
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  // Socket connection setup
  useEffect(() => {
    if (!user?.token) return;
    const socketInstance = io("https://distress-server.onrender.com", {auth: {token: user?.token}})
    if (socketInstance.connected) {
      onConnect()
    }
    
    // Socket connection handlers
    function onConnect() {
      setIsConnected(true)
      setTransport(socketInstance.io.engine.transport.name)

      socketInstance.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name)
      })
    }

    function onDisconnect() {
      setIsConnected(false)
      setTransport('N/A')
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on('disconnect', onDisconnect)

    setSocket(socketInstance)

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      if (socketInstance) {
        socketInstance.disconnect()
      }
    };
  }, [user?.token]);

  // Initialize audio recorder with high quality preset
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)

  // Handle app state changes to stop recording when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState !== 'active' && isRecording) {
        await stopRecording();
      }
      if (nextAppState !== 'active' && isVideoRecording) {
        await stopVideoRecording();
      }
    });
  
    return () => subscription.remove();
  }, [isRecording, isVideoRecording]);

  // Start audio recording
  const record = async () => {
    await audioRecorder.prepareToRecordAsync()
    audioRecorder.record()
    setIsRecording(true)
  }

  // Stop audio recording and handle cleanup
  const stopRecording = async () => {
    await audioRecorder.stop()
    setIsRecording(false)
    setRecordingURI(audioRecorder.uri)
    if (audioRecorder.uri) {
      const response = await FileSystem.readAsStringAsync(audioRecorder.uri, { encoding: FileSystem.EncodingType.Base64 })
      socket.emit('stop', response)
    }
    console.log(audioRecorder.isRecording, audioRecorder.currentTime, audioRecorder.uri, 'audio stop record')
  }

  // Play recorded audio
  const playRecording = async () => {
    console.log(recordingURI)
    player.replace(recordingURI)
    player.play()
  }

  // Convert base64 to Blob for file upload
  function base64ToBlob(base64: string, contentType = '', sliceSize = 512): Blob {
    console.log('blob started')
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    console.log(byteArrays)
    console.log(new Blob(byteArrays, { type: contentType }));
    return new Blob(byteArrays, { type: contentType });
  }

  // Upload recording to Firebase storage
  const uploadRecording = async (recording: string | null) => {
    try {
      if (recording) {
        console.log('running')
        const refStorage = storageRef(storage, `users/${user?.id}/${recording.split('/').pop()}`)
        console.log(refStorage)
        const response = await FileSystem.readAsStringAsync(recording, { encoding: FileSystem.EncodingType.Base64 })
        const blob = await (await fetch('file://' + recording)).blob()
        console.log(blob)
        const uploadTask = await uploadBytes(refStorage, blob)
        console.log(uploadTask)
      }
    } catch (error) {
      console.log(JSON.stringify(error))
    }
  }

  // Upload video to Firebase storage
  const uploadVideo = async (video: string | null) => {
    try {
      if (video) {
        const refStorage = storageRef(storage, `users/${user?.id}/video_${Date.now()}.mp4`)
        const blob = await (await fetch(video)).blob()
        await uploadBytes(refStorage, blob)
        console.log('Video uploaded')
      }
    } catch (error) {
      console.log('Video upload error:', error)
    }
  }

  // Camera video recording handlers
  const startVideoRecording = async () => {
    if (cameraRef.current && !isVideoRecording) {
      try {
        setIsVideoRecording(true);
        const videoRecordPromise = cameraRef.current.recordAsync({
          maxDuration: 30, // seconds, adjust as needed
          quality: Camera.Constants.VideoQuality['480p'],
        });
        if (videoRecordPromise) {
          const data = await videoRecordPromise;
          setVideoURI(data.uri);
          await uploadVideo(data.uri);
        }
      } catch (e) {
        console.log('Video recording error:', e);
      } finally {
        setIsVideoRecording(false);
      }
    }
  };

  const stopVideoRecording = async () => {
    if (cameraRef.current && isVideoRecording) {
      try {
        await cameraRef.current.stopRecording();
      } catch (e) {
        console.log('Stop video error:', e);
      }
      setIsVideoRecording(false);
    }
  };

  // Create emergency alert with location, recording, and video
  const createEmergencyAlert = async () => {
    try {
      const location = await requestLocation();
      const res = await api.post("/distress", {
        userId: user?.id,
        message: message === '' ? 'I am in distress' : message,
        additionalDetails: {
          batteryLevel: batteryLevel * 100,
        },
        location: location
      }, { headers: { Authorization: `Bearer ${user?.token}` } });
      // console.log(res.data);
      // setEmergencyId(res.data._id);
      // setEmergency(true);
      // await startBackgroundLocation()
      // if (!isRecording) {
      await record()
      // } else {
      //   await stopRecording()
      // }
      await setBrightness();
      displayToast();
      // Start video recording in background
      if (hasCameraPermission) {
        startVideoRecording();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      logout(dispatch);
      router.replace("/(auth)/authIndex");
    } catch (err) {
      console.log(err);
    }
  };

  // Validate user session on screen focus
  useFocusEffect(() => {
    (async () => {
      if (user) {
        try {
          await validateToken(user)
        } catch (error: any) {
          showToast('Session expired. For your security, please log in again.', 'info')
          router.replace('/(auth)/authIndex')
        }
      } else {
        showToast('Please log in again.', 'error')
        router.replace('/(auth)/authIndex')
      }
    })()
  })

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={
          receivedEmergency
            ? ["#a80000", "#c60000", "#a80000", "#c60000"]
            : ["#000000", "#161616", "#000000", "#161616"]
        }
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: windowHeight,
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1 }}>

            <TouchableOpacity
              style={{ alignSelf: "flex-end", paddingHorizontal: 16 }}
              onPress={handleLogout}
            >
              <AntDesign name="logout" size={30} color="white" />
            </TouchableOpacity>
            {toast ? (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "#161616",
                  borderRadius: 32,
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  zIndex: 200,
                  // flex: 1,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#222",
                    borderWidth: 1,
                    borderColor: "#7a7a7a40",
                    borderRadius: 100,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 36, lineHeight: 43, color: "#7a7a7a" }}>
                    !
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#7a7a7a", fontSize: 15, lineHeight: 20 }}>
                    Your emergency contacts have been notified, please stay calm!
                  </Text>
                </View>
              </View>
            ) : null}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >

              <TouchableOpacity onPress={createEmergencyAlert}>
                <View
                  style={{
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!receivedEmergency ? (
                    <>
                      <Image
                        style={{ position: "absolute", width: 200, height: 200 }}
                        source={require("@/assets/images/Ellipse1.png")}
                      />
                      <Image
                        style={{ position: "absolute", width: 200, height: 200 }}
                        source={require("@/assets/images/Ellipse2.png")}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        style={{ position: "absolute" }}
                        source={require("@/assets/images/Ellipse3.png")}
                      />
                      <Image
                        style={{ position: "absolute" }}
                        source={require("@/assets/images/Ellipse4.png")}
                      />
                    </>
                  )}
                  <View
                    style={{
                      backgroundColor: receivedEmergency ? "#e9e9e940" : "#c6000040",
                      width: 190,
                      height: 190,
                      borderRadius: 200,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: receivedEmergency
                          ? "#e9e9e960"
                          : "#c6000060",
                        width: 150,
                        height: 150,
                        borderRadius: 100,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: receivedEmergency
                            ? "#e9e9e980"
                            : "#c6000080",
                          width: 110,
                          height: 110,
                          borderRadius: 100,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: receivedEmergency
                              ? "#e9e9e9"
                              : "#c60000",
                            width: 70,
                            height: 70,
                            borderRadius: 100,
                            justifyContent: "center",
                            alignItems: "center",
                            // borderWidth: 6,
                            position: "relative",
                            borderColor: receivedEmergency
                              ? "#c6000025"
                              : "#54010175",
                          }}
                        >
                          {/* {[...Array(3).keys()].map((index) => {
                return (
                  <MotiView
                    from={{ opacity: 0.7, scale: 1 }}
                    animate={{ opacity: 0, scale: 3 }}
                    transition={{
                      type: "timing",
                      duration: 2000,
                      easing: Easing.out(Easing.ease),
                      delay: index * 400,
                      repeatReverse: false,
                      loop: true,
                    }}
                    key={index}

                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        width: 100,
                        height: 100,
                        backgroundColor: receivedEmergency ? "#e9e9e9" : "#c60000",
                        borderRadius: 100,
                      },
                    ]}
                  />
                );
              })} */}
                          <Text
                            style={{
                              color: receivedEmergency ? "#c6000025" : "#540101",
                              fontSize: 64,
                            }}
                          >
                            !
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                {/* <Text>Distress Sent!</Text> */}
              </TouchableOpacity>

              {/* Camera preview (hidden, for background recording) */}
              {hasCameraPermission && (
                <Camera
                  ref={cameraRef}
                  style={{ width: 1, height: 1, position: 'absolute', left: -1000, top: -1000 }}
                  type={CameraType.back}
                  ratio="16:9"
                  // You can add more camera props as needed
                />
              )}

              {/* <View style={{ marginTop: 100, gap: 20 }}>
          <Text
            style={{
              color: receivedEmergency ? "#e9e9e9" : "#c60000",
              fontSize: 32,
              lineHeight: 48,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {emergency
              ? "Distress Sent!"
              : receivedEmergency
                ? "Distress Alert!"
                : ""}
          </Text>
          {receivedEmergency ? (
            <Text
              style={{
                fontSize: 24,
                lineHeight: 36,
                color: "#b6b6b6",
                textAlign: "center",
              }}
            >
              Your contact{" "}
              <Text style={{ color: "#e9e9e9", fontWeight: "700" }}>
                @Adebayo
              </Text>{" "}
              is in an emergency
            </Text>
          ) : null}
          {receivedEmergency ? (
            <View style={{ alignItems: "center" }}>
              <Link href={"/(screens)/monitor"} asChild>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#e9e9e9",
                    borderRadius: 32,
                    paddingHorizontal: 36,
                    paddingVertical: 9,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: 24,
                      lineHeight: 36,
                      color: "#c60000",
                    }}
                  >
                    Monitor
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : null}
        </View> */}


            </View>
            {/* {!receivedEmergency ? (
          <View
            style={{
              // position: "absolute",
              // bottom: 0,
              backgroundColor: "#161616",
              borderRadius: 24,
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                //   lineHeight: 24,
                fontWeight: "700",
                color: "#7a7a7a",
              }}
            >
              ! STAY CALM, KEEP YOUR PHONE HIDDEN AND IF POSSIBLE, ALLOW A MEANS
              TO CAPTURE ACTIVITIES SO IT’S SENT TO YOUR CONTACTS !
            </Text>
          </View>
        ) : null} */}
            {/* <TouchableOpacity onPress={playRecording}>
              <Text style={{ color: 'white', backgroundColor: 'blue' }}>TESTING</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => uploadRecording(recordingURI)}>
              <Text style={{ color: 'white', backgroundColor: 'blue' }}>UPLOAD</Text>
            </TouchableOpacity> */}
            <View
              style={{
                // position: 'absolute',
                // bottom: 24,
                backgroundColor: "#161616",
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 16,
              }}
            >
              <TextInput
                value={message}
                onChangeText={(text) => setMessage(text)}
                style={{
                  fontSize: 14,
                  //   lineHeight: 24,
                  fontWeight: "700",
                  color: "#7a7a7a",
                }}
                // multiline
                placeholder='Enter message...'
              />
            </View>
            {/* Optionally, show video preview for debugging */}
            {/* {videoURI && (
              <Video
                source={{ uri: videoURI }}
                style={{ width: 200, height: 200 }}
                useNativeControls
                resizeMode="contain"
                isLooping
              />
            )} */}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
