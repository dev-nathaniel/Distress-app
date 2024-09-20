import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import PermissionButton from "@/components/PermissionButton";
import * as Contacts from "expo-contacts";
import * as Location from "expo-location";
import * as Brightness from "expo-brightness";
import { Audio } from "expo-av";
import { useCameraPermissions } from "expo-camera";
import { Link, router } from "expo-router";

export default function Permissions() {
  const windowHeight = Dimensions.get("window").height;
  const [audioPermissionResponse, requestAudioPermission] =
    Audio.usePermissions();
  const [cameraPermissionResponse, requestCameraPermission] =
    useCameraPermissions();
  const [locationPermissionResponse, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [brightnessPermissionResponse, requestBrightnessPermission] =
    Brightness.usePermissions();
  const [contactPermissionStatus, setContactPermissionStatus] =
    useState<Contacts.PermissionStatus>(Contacts.PermissionStatus.UNDETERMINED);
  const [permissionsChecked, setPermissionsChecked] = useState(false);

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

  const requestLocation = async () => {
    // console.log("test");
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

  const requestCamera = async () => {
    // console.log("test");
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

  const requestMicrophone = async () => {
    // console.log("test");
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

  const requestContacts = async () => {
    // console.log("test");
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

  useEffect(() => {
    if (
      audioPermissionResponse?.status !== "granted" ||
      cameraPermissionResponse?.status !== "granted" ||
      locationPermissionResponse?.status !== "granted" ||
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
    brightnessPermissionResponse?.status,
    contactPermissionStatus,
  ]);

  useEffect(() => {
    if (permissionsChecked) {
      router.replace("/(auth)/selectContacts");
    }
  }, [permissionsChecked]);

  //   useEffect(() => {

  //   }, [audioPermissionResponse?.status, cameraPermissionResponse?.status, locationPermissionResponse?.status, contactPermissionStatus])
  return (
    <SafeAreaView style={{ flex: 1 }}>
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
      <View style={{ flex: 1, marginHorizontal: 16, justifyContent: "center" }}>
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
        <View style={{ alignItems: "center" }}>
          <Image source={require("@/assets/images/bell.png")} />
        </View>

        <View style={{ marginTop: 64 }}>
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
