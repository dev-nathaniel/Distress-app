// Import React Native core components
import {
  Alert,
  AppState,
  Dimensions,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Import React hooks and utilities
import { SetStateAction, useEffect, useState } from "react";

// Import safe area handling
import { SafeAreaView } from "react-native-safe-area-context";

// Import UI components
import { LinearGradient } from "expo-linear-gradient";
import PermissionButton from "@/components/PermissionButton";

// Import device permission modules
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import * as Brightness from "expo-brightness";
import { Audio } from "expo-av";
import { useCameraPermissions } from "expo-camera";

// Import navigation utilities
import { Link, router } from "expo-router";

// Import Redux utilities
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getEmergencyContacts } from "@/redux/apiCalls";

// Import API utilities
import { api } from "@/axios";

// Import toast context
import { useToast } from "@/context/ToastContext";
import React from "react";
import GlobalToast from "@/components/GlobalToast";

// Function to validate user authentication token
// Takes user object with id and token, and optional loading state setter
export const validateToken = async (user: {id: string, token: string}, setLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
  // Set loading state if provided
  if(setLoading) {
    setLoading(true);
  }
  try {
    // Make API call to validate token
    const response = await api.get('/auth/token/validate', {headers: {Authorization: `Bearer ${user?.token}` }});
    if(setLoading)setLoading(false)
      // if (!response.data.valid) {
    //   router.push('/login');
    // }
  } catch (error) {
    console.log('Error validating token:', error);
    if(setLoading)setLoading(false)
    throw error
    // router.replace('/(auth)/authIndex');
  }
};

// Main permissions screen component
export default function Permissions() {
  // Get window dimensions for responsive layout
  const windowHeight = Dimensions.get("window").height;
  
  // Permission states for various device features
  const [audioPermissionResponse, requestAudioPermission] = Audio.usePermissions();
  const [cameraPermissionResponse, requestCameraPermission] = useCameraPermissions();
  const [locationPermissionResponse, requestLocationPermission] = Location.useForegroundPermissions();
  // Trial and error: Background location tracking
  // const [backgroundLocationPermissionResponse, requestBackgroundLocationPermission] = Location.useBackgroundPermissions()
  const [brightnessPermissionResponse, requestBrightnessPermission] = Brightness.usePermissions();
  const [contactPermissionStatus, setContactPermissionStatus] = useState<Contacts.PermissionStatus>(Contacts.PermissionStatus.UNDETERMINED);
  
  // State to track if all permissions have been checked
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  
  // Redux state for emergency contacts and user
  const hasEmergencyContacts = useSelector((state: RootState) => state.user.emergencyContacts) 
  const user = useSelector((state: RootState) => state.user.currentUser) 
  const [contactsChecked, setContactsChecked] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)

  // Toast context for notifications
  const { showToast } = useToast()
  const dispatch = useDispatch();


  //   if (!cameraPermissionResponse) {
  //   //     // Camera permissions are still loading.
  //   //     return <View />;
  //   //   }

  //   //   if (!permission.granted) {
  //   //     // Camera permissions are not granted yet.
  //   //     return (
  //   //       <View style={styles.container}>
  //   //         <Text style={styles.message}>We need your permission to show the camera</Text>
  //   //         <Button onPress={requestPermission} title="grant permission" />
  //   //       </View>
  //   //     );
  //   //   }

  // Function to request location permission
  const requestLocation = async () => {
    if (locationPermissionResponse?.status !== "granted") {
      // console.log("tested");
      // await requestLocationPermission();
      Alert.alert(
        "Location Permission Required",
        "This app needs access to your location. Please grant permission in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
    }
  };

  // Trial and error: Background location permission handling
  // const requestBackgroundLocation = async () => {
  //   if (backgroundLocationPermissionResponse?.status !== 'granted') {
  //     Alert.alert(
  //       "Background Location Permission Required",
  //       "This app needs access to your background location. Please grant permission in the app settings.",
  //       [
  //         { text: "Cancel", style: "cancel"},
  //         { text: "Open Settings", onPress: openSettings }
  //       ]
  //     )
  //   }
  // }

  // Function to request camera permission
  const requestCamera = async () => {
    if (cameraPermissionResponse?.status !== "granted") {
      // console.log("tested");
      // await requestLocationPermission();
      Alert.alert(
        "Camera Permission Required",
        "This app needs access to your camera. Please grant permission in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
    }
  };

  // Function to request microphone permission
  const requestMicrophone = async () => {
    if (audioPermissionResponse?.status !== "granted") {
      // console.log("tested");
      // await requestLocationPermission();
      Alert.alert(
        "Audio Permission Required",
        "This app needs access to your audio. Please grant permission in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
    }
  };

  // Function to request contacts permission
  const requestContacts = async () => {
    if (contactPermissionStatus !== "granted") {
      // console.log("tested");
      // await requestLocationPermission();
      Alert.alert(
        "Contacts Permission Required",
        "This app needs access to your contacts. Please grant permission in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
    }
  };

  // Function to request brightness permission
  const requestBrightness = async () => {
    if (brightnessPermissionResponse?.status !== "granted") {
      // console.log("tested");
      // await requestLocationPermission();
      Alert.alert(
        "Brightness Permission Required",
        "This app needs access to your brightness. Please grant permission in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openSettings },
        ]
      );
    }
  };

  // Function to open device settings
  const openSettings = () => {
    // if (Platform.OS === "ios") {
    //   Linking.openURL("app-settings:");
    // } else {
    Linking.openSettings();
    // }
  };

  //   const handleDeniedContactsPermission = () => {
  //     Alert.alert(
  //       "Contacts Permission Required",
  //       "This app needs access to your contacts. Please grant permission in the app settings.",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         { text: "Open Settings", onPress: openSettings },
  //       ]
  //     );
  //   };

  // Effect to request all permissions on component mount
  useEffect(() => {
    (async () => {
      try {
        // let { status: LocationStatus } =
        //   await Location.requestForegroundPermissionsAsync();
        if (audioPermissionResponse?.status != "granted") {
          console.log("requesting audio permission");
          await requestAudioPermission();
        }
        if (cameraPermissionResponse?.status !== "granted") {
          console.log("requesting camera permission");
          await requestCameraPermission();
        }
        if (locationPermissionResponse?.status !== "granted") {
          console.log("requesting location permission");
          await requestLocationPermission();
        }
        // if (backgroundLocationPermissionResponse?.status !== "granted") {
        //   console.log("requesting background location permission")
        //   await requestBackgroundLocationPermission()
        // }
        if (brightnessPermissionResponse?.status !== "granted") {
          console.log("requesting brightness permission");
          await requestBrightnessPermission();
        }
        if (contactPermissionStatus !== "granted") {
          console.log("trying to request contact permission");
          const { status: ContactStatus } =
            await Contacts.requestPermissionsAsync();
          setContactPermissionStatus(ContactStatus);
        }
        // const { status: ContactStatus } =
        //   await Contacts.requestPermissionsAsync();
        // setContactPermissionStatus(ContactStatus)
        // console.log(ContactStatus);
        // if (ContactStatus === "granted") {
        //   const { data } = await Contacts.getContactsAsync({
        //     fields: [Contacts.Fields.Emails],
        //   });

        //   if (data.length > 0) {
        //     const contact = data[0];
        //     console.log(contact);
        //   }
        // }
        // if (LocationStatus !== "granted") {
        //   // setErrorMsg('Permission to access location was denied');
        //   return;
        // }

        // let location = await Location.getCurrentPositionAsync({});
        //   setLocation(location);
      } catch (err) {
        console.log(err);
        // handleDeniedContactsPermission();
      }
    })();
  }, []);

  // Effect to check if all permissions are granted
  useEffect(() => {
    if (
      audioPermissionResponse?.status !== "granted" ||
      cameraPermissionResponse?.status !== "granted" ||
      locationPermissionResponse?.status !== "granted" ||
      // backgroundLocationPermissionResponse?.status !== "granted" ||
      brightnessPermissionResponse?.status !== "granted" ||
      contactPermissionStatus !== "granted"
    ) {
      setPermissionsChecked(false);
    } else {
      setPermissionsChecked(true);
    }
  }, [
    audioPermissionResponse?.status,
    cameraPermissionResponse?.status,
    locationPermissionResponse?.status,
    // backgroundLocationPermissionResponse?.status,
    brightnessPermissionResponse?.status,
    contactPermissionStatus,
  ]);

  // Effect to check permissions when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === 'active') {
        setPermissionsChecked(
          audioPermissionResponse?.status === "granted" &&
          cameraPermissionResponse?.status === "granted" &&
          locationPermissionResponse?.status === "granted" &&
          // backgroundLocationPermissionResponse?.status === "granted" &&
          brightnessPermissionResponse?.status === "granted" &&
          contactPermissionStatus === "granted"
        )
      }
    })

    return () => subscription.remove()
  })

  // Effect to request permissions when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === 'active') {
        (async () => {
          try {
            if (audioPermissionResponse?.status != "granted") {
              console.log("requesting audio permission");
              await requestAudioPermission();
            }
            if (cameraPermissionResponse?.status !== "granted") {
              console.log("requesting camera permission");
              await requestCameraPermission();
            }
            if (locationPermissionResponse?.status !== "granted") {
              console.log("requesting location permission");
              await requestLocationPermission();
            }
            // if (backgroundLocationPermissionResponse?.status !== "granted") {
            //   console.log("requesting background location permission")
            //   await requestBackgroundLocationPermission()
            // }
            if (brightnessPermissionResponse?.status !== "granted") {
              console.log("requesting brightness permission");
              await requestBrightnessPermission();
            }
            if (contactPermissionStatus !== "granted") {
              console.log("trying to request contact permission");
              const { status: ContactStatus } =
                await Contacts.requestPermissionsAsync();
              setContactPermissionStatus(ContactStatus);
            }
          } catch (err) {
            console.log(err);
            // handleDeniedContactsPermission();
          }
        })();
      }
    })

    return () => subscription.remove()
  })

  // Effect to validate token and get emergency contacts when permissions are granted
  useEffect(() => {
    (async () => {
    console.log(permissionsChecked)
    if (permissionsChecked) {
      
      if (user?.id && user.token) {   
        try {
        await validateToken(user, setLoading)     
        await getEmergencyContacts(dispatch, user.id, user.token)
        setContactsChecked(true)
        } catch (error:any) {
          console.log(error.response.status)
          if (error.response.status == '401') {
            showToast('Session expired. For your security, please log in again.', 'info')
            router.replace('/(auth)/authIndex')
          }
        }
      }
      
    }})()
  }, [permissionsChecked]);

  // Effect to navigate based on emergency contacts status
  useEffect(() => {
    if (!contactsChecked) {
      return
    }
    if (hasEmergencyContacts) {
      router.replace("/(screens)/homeIndex")
    } else {
      router.replace("/(auth)/selectContacts");
    }
  }, [hasEmergencyContacts, contactsChecked])

  //   useEffect(() => {

  //   }, [audioPermissionResponse?.status, cameraPermissionResponse?.status, locationPermissionResponse?.status, contactPermissionStatus])

  // Render the permissions screen
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Show loading toast when checking permissions */}
      {loading ? <GlobalToast toast={{message: 'Checking Permissions', type: 'loading'}} /> : null}
      
      {/* Background gradient */}
      <LinearGradient
        colors={["#000000", "#161616", "#161616", "#000000"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: windowHeight,
        }}
      />
      
      {/* Main content container */}
      <View style={{ flex: 1, marginHorizontal: 16, justifyContent: "center" }}>
        {/* Warning toast when permissions are not granted */}
        {!permissionsChecked ? (
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
                Please allow access to every permission, this helps us fulfil
                our purpose.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Bell icon */}
        <View style={{ alignItems: "center" }}>
          <Image source={require("@/assets/images/bell.png")} />
        </View>

        {/* Permission buttons container */}
        <View style={{ marginTop: 64 }}>
          {/* Render permission buttons for each required permission */}
          {contactPermissionStatus !== "granted" ? (
            <PermissionButton
              requestPermission={() => requestContacts()}
              text={"ALLOW ACCESS TO YOUR CONTACTS"}
            />
          ) : null}
          {cameraPermissionResponse?.status !== "granted" ? (
            <PermissionButton
              requestPermission={() => requestCamera()}
              text={"ALLOW ACCESS TO YOUR CAMERA"}
            />
          ) : null}
          {locationPermissionResponse?.status !== "granted" ? (
            <PermissionButton
              requestPermission={() => requestLocation()}
              text={"ALLOW ACCESS TO YOUR LOCATION"}
            />
          ) : null}
          {/* {backgroundLocationPermissionResponse?.status !== "granted" ? (
            <PermissionButton
              requestPermission={() => requestBackgroundLocation()}
              text={"ALLOW ACCESS TO BACKGROUND LOCATION"}
            />
          ) : null} */}
          {audioPermissionResponse?.status !== "granted" ? (
            <PermissionButton
              requestPermission={() => requestMicrophone()}
              text={"ALLOW ACCESS TO YOUR MICROPHONE"}
            />
          ) : null}
          {brightnessPermissionResponse?.status !== "granted" ? (
            <PermissionButton
              requestPermission={() => requestBrightness()}
              text={"ALLOW ACCESS TO YOUR BRIGHTNESS"}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
