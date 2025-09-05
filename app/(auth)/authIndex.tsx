import {
  Dimensions,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputChangeEventData,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "@/components/CustomInput";
import Checkbox from "expo-checkbox";
import { Link, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { User } from "@/redux/slices/userSlice";
import { login, register } from "@/redux/apiCalls";

export default function AuthIndex() {
  const windowHeight = Dimensions.get("window").height;
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

  const [values, setValues] = useState<User>({
    address: "",
    email: "",
    fullname: "",
    phoneNumber: "",
    password: "",
  });

  const [terms, setTerms] = useState<boolean>(true);

  const onChange = (name: string, e: string) => {
    setValues((prevValues) => ({ ...prevValues, [name]: e }));
  };

  const onValueChange = (e: boolean) => {
    setTerms(e);
  };

  // useEffect(() => {
  //   if (user) {
  //     router.replace("/(auth)/permissions");
  //   }
  // }, [user, router]);

  const handleSubmit = async () => {
    try {
      // if (terms == true) {
      //   register(dispatch, { ...values });
      // }
      await login(dispatch, { ...values });
      router.replace("/(screens)/screenIndex");
    } catch (err) {
      console.log(err);
      showToast('Login Failed!', 'error')
    }
  };

  // Effect to handle address suggestions
  useEffect(() => {
    setGooglePlaceSelected('')
    const fetchPlaces = async () => {
      if (!values.address) {
        return
      }

      // Trial and error: Alternative Places API endpoint
      // const url = `https://places.googleapis.com/v1/places:autocomplete/json?input=${encodeURIComponent(values.address)}&key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}&language=en`
      const url = 'https://places.googleapis.com/v1/places:autocomplete'

      try {
        const res = await axios.post(url, { input: values.address, regionCode: 'uk' }, { headers: { "X-Goog-Api-Key": `${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}` } })
        // const data = await res.json()
        const data = res.data
        if (data.suggestions) {
          console.log(data.suggestions[1])
          setSuggestions(data.suggestions)
        }
      } catch (error) {
        console.log("Places API error:", error)
      }
    }

    const timeout = setTimeout(fetchPlaces, 300);
    return () => clearTimeout(timeout)
  }, [values.address])
  const addressInput = React.useRef<TextInput>(null)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Trial and error: Google Places Autocomplete component */}
      {/* <GooglePlacesAutocomplete predefinedPlaces={[]} styles={{}} onPress={(data, details)=>console.log(data)} placeholder="search" query={{key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY, language: 'en'}}
          /> */}
      
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
      <View style={{ flex: 1, marginHorizontal: 16, justifyContent: "center" }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: "#7a7a7a",
              fontWeight: "700",
              fontSize: 20,
              lineHeight: 30,
            }}
          >
            Enter your info to register
          </Text>
        </View>

        <LinearGradient
          colors={["#161616", "#000000"]}
          style={{
            marginTop: 36,
            borderRadius: 32,
            paddingBottom: 32,
            paddingHorizontal: 16,
          }}
        >
          <CustomInput
            onChange={(e) => onChange("fullname", e)}
            placeholder="Kurosaki Ichigo"
            keyboardType="default"
            value={values["fullname"]}
          />
          <CustomInput
            onChange={(e) => onChange("email", e)}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={values["email"]}
          />
          <CustomInput
            onChange={(e) => onChange("phoneNumber", e)}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={values["phoneNumber"]}
          />
          <CustomInput
            onChange={(e) => onChange("address", e)}
            placeholder="Home address"
            keyboardType="default"
            value={values["address"]}
          />
          <CustomInput
            onChange={(e) => onChange("password", e)}
            placeholder="Password"
            secureTextEntry={true}
            value={values["password"]}
          />
          <CustomInput secureTextEntry={true} placeholder="Confirm Password" />
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Checkbox value={terms} onValueChange={(e) => onValueChange(e)} />
            <Text style={{ color: "#7a7a7a" }}>
              I agree to the terms stated below
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {/* <Link href={"/permissions"} asChild> */}
            <TouchableOpacity
              style={{
                backgroundColor: "#171717",
                borderWidth: 1,
                borderRadius: 32,
                paddingVertical: 16,
                paddingHorizontal: 36,
                borderColor: "#7a7a7a25",
                marginTop: 26,
              }}
              onPress={handleSubmit}
            >
              {/* <Text
                style={{
                  color: "#7a7a7a",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 22.5,
                }}
              >
                SUBMIT AND REGISTER
              </Text> */}
              <Text
                style={{
                  color: "#7a7a7a",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 22.5,
                }}
              >
                LOGIN
              </Text>
            </TouchableOpacity>
            {/* </Link> */}
          </View>
        </LinearGradient>

        <View
          style={{
            marginTop: 36,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#171717",
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}
        >
          <View></View>
          <Text style={{ fontSize: 15, lineHeight: 20.5, color: "#7a7a7a" }}>
            READ OUR TERMS AND CONDITIONS
          </Text>
          <View></View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
