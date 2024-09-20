import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type focusType = "camera" | "map";

export default function Monitor() {
  //   const mapRef = useRef<MapView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [focus, setFocus] = useState<focusType>("camera");
  const windowHeight = Dimensions.get("window").height;

  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [focus]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    requestPermission();
  }

  const changeFocus = (focus: focusType) => {
    if (focus == "camera") {
      setFocus("map");
    } else {
      setFocus("camera");
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CameraView
        style={
          focus == "camera"
            ? { ...StyleSheet.absoluteFillObject }
            : {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: windowHeight * 0.41,
                marginVertical: 12,
                marginHorizontal: 12,
                borderRadius: 36,
                zIndex: 50,
              }
        }
        facing={facing}
      >
        <View
          style={{
            backgroundColor: "#161616",
            position: "absolute",
            top: windowHeight * 0.07,
            right: 16,
            borderRadius: 16,
            padding: 7,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 100,
              backgroundColor: "#c60000",
            }}
          ></View>
          <Text
            style={{
              color: "#7a7a7a",
              fontSize: 12,
              lineHeight: 18,
              fontWeight: "500",
            }}
          >
            live coverage
          </Text>
        </View>
      </CameraView>
      <MapView
        key={mapKey}
        style={
          focus == "map"
            ? { ...StyleSheet.absoluteFillObject }
            : {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: windowHeight * 0.41,
                marginVertical: 12,
                marginHorizontal: 12,
                borderRadius: 36,
              }
        }
        region={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        userInterfaceStyle="dark"
      ></MapView>
      <TouchableOpacity
        style={{ zIndex: 500 }}
        onPress={() => changeFocus(focus)}
      >
        <View
          style={{
            position: "absolute",
            top: windowHeight * 0.52,
            right: 25,
            borderRadius: 100,
            padding: 8,
            backgroundColor: "white",
          }}
        >
          <MaterialCommunityIcons name="arrow-expand" size={24} color="black" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
