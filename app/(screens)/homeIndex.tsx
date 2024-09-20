import {
  Dimensions,
  // Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import * as Burnt from "burnt";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useBatteryLevel } from "expo-battery";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import * as Location from "expo-location";
import { api } from "@/axios";
import * as TaskManager from "expo-task-manager";
import * as Brightness from "expo-brightness";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/apiCalls";
import { socket } from "@/socket";

export default function HomeScreen() {
  const windowHeight = Dimensions.get("window").height;
  const [emergency, setEmergency] = useState(false);
  const [emergencyId, setEmergencyId] = useState();
  const [receivedEmergency, setReceivedEmergency] = useState(false);
  const [receivedEmergencies, setReceivedEmergencies] = useState<any[]>([]);
  const [toast, setToast] = useState(false);
  // const [mostRecentEmergency, setMostRecentEmergency] = useState();
  const batteryLevel = useBatteryLevel();
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const user = useSelector((state: RootState) =>
    state.user.currentUser === null ? null : state.user.currentUser
  );
  const isLoading = useSelector((state: RootState) =>
    state.user.isFetching === null ? null : state.user.isFetching
  );
  const errorMessage = useSelector((state: RootState) =>
    state.user.error === null ? null : state.user.error
  );
  const dispatch = useDispatch();

  const database = getDatabase(app);

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

  const setBrightness = async () => {
    const { status } = await Brightness.requestPermissionsAsync();
    console.log(await Brightness.isAvailableAsync());
    if (status === "granted") {
      await Brightness.setSystemBrightnessAsync(0);
      const test = await Brightness.getBrightnessAsync();
      console.log(test);
    }
  };

  // TaskManager.defineTask("LOCATION_TASK", ({ data: { locations }, error }) => {
  //  if (error) {
  //    // check `error.message` for more details.
  //    return;
  //  }
  //  console.log('Received new locations', locations);
  //  setLocation(locations)
  // });

  //   await Location.startLocationUpdatesAsync("LOCATION_TASK", {distanceInterval: 4})

  console.log(batteryLevel);

  const displayToast = () => {
    // Burnt.toast({
    //   title: "congrats",
    //   preset: "done",
    //   haptic: "success",
    //   duration: 3,
    //   shouldDismissByDrag: true,
    //   from: "top",
    //   layout: {

    //   }
    // });
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  // useEffect(() => {
  //   function onConnect() {
  //     socket.emit("pollRequest", user?._id);
  //   }

  //   const storeEmergencies = (data: any) => {
  //     if (data.error) {
  //       socket.emit("pollRequest", user?._id);
  //     } else {
  //       const filteredData = data.filter(
  //         (item: any) =>
  //           !receivedEmergencies.some(
  //             (existingItem) => existingItem._id === item._id
  //           )
  //       );
  //       if (filteredData.length > 0) {
  //         setReceivedEmergencies((existingData) => [
  //           ...existingData,
  //           ...filteredData,
  //         ]);
  //       }

  //       setTimeout(() => {
  //         console.log(receivedEmergencies);
  //         socket.emit("pollRequest");
  //       }, 2000);
  //     }
  //   };

  //   socket.on("pollResponse", storeEmergencies);

  //   socket.on("connect", onConnect);

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("pollResponse", storeEmergencies);
  //   };
  // }, []);

  const createEmergencyAlert = async () => {
    try {
      // const location = await requestLocation();
      const res = await api.post("/emergency", {
        userId: user?._id,
        emergencyData: { batteryLevel: batteryLevel, location: location },
      });
      // console.log(res.data);
      // setEmergencyId(res.data._id);
      setEmergency(true);
      // await setBrightness();
      displayToast();
    } catch (err) {
      console.log(err);
    }
  };

  // const constantEmergencyFetch = async () => {
  //   setInterval(
  //   }, 1000);
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await api.get(`/emergency/${user?._id}`);
  //       const emergencies = res.data;
  //       setReceivedEmergencies((prevData) => {
  //         // Filter out items that already exist in the previous data
  //         const uniqueNewData = emergencies.filter(
  //           (newItem: any) =>
  //             !prevData?.some((existingItem) => existingItem.id === newItem.id)
  //         );

  //         // Combine the existing data with the unique new data
  //         return [...prevData, ...uniqueNewData];
  //       });
  //     } catch (err) {
  //       console.log(err, user?._id);
  //     }
  //   };

  //   // Fetch data every second
  //   const intervalId = setInterval(fetchData, 1000);

  //   // Clean up the interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, []);

  // useEffect(() => {
  //   if (receivedEmergencies.length > 0) {
  //     setMostRecentEmergency(
  //       receivedEmergencies[receivedEmergencies.length - 1]
  //     );
  //     setReceivedEmergency(true);
  //   }
  // }, [receivedEmergencies]);

  // useEffect(() => {
  //   let locationSub: Location.LocationSubscription;
  //   (async () => {
  //     locationSub = await Location.watchPositionAsync({}, (location) => {
  //       setLocation(location);
  //     });
  //   })();

  //   return () => {
  //     locationSub.remove();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (emergency) {
  //     set(ref(database, "emergencyEvents/" + emergencyId), {
  //       battery_level: batteryLevel,
  //       location: location,
  //     });
  //   }
  // }, [location, batteryLevel, emergency]);

  const handleLogout = async () => {
    try {
      logout(dispatch);
      router.replace("/(auth)");
    } catch (err) {
      console.log(err);
    }
  };

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
      <TouchableOpacity
        style={{ alignSelf: "flex-end", paddingHorizontal: 12 }}
        onPress={handleLogout}
      >
        <AntDesign name="logout" size={24} color="black" />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 12,
        }}
      >
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
                  style={{ position: "absolute" }}
                  source={require("@/assets/images/Ellipse1.png")}
                />
                <Image
                  style={{ position: "absolute" }}
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
                width: 220,
                height: 220,
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
                  width: 180,
                  height: 180,
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
                    width: 140,
                    height: 140,
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
                      width: 100,
                      height: 100,
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

        <View style={{ marginTop: 100, gap: 20 }}>
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
        </View>

        {!receivedEmergency ? (
          <View
            style={{
              position: "absolute",
              bottom: 0,
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
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
