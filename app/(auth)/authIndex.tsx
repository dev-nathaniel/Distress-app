import {
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputChangeEventData,
  TouchableOpacity,
  View,
} from "react-native";
import 'react-native-get-random-values'
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "@/components/CustomInput";
import Checkbox from "expo-checkbox";
import { Link, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { User } from "@/redux/slices/userSlice";
import { getEmergencyContacts, login, register } from "@/redux/apiCalls";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import Spinner from "@/components/Spinner";
import React from "react";

export default function AuthIndex() {
  // Get window dimensions for responsive layout
  const windowHeight = Dimensions.get("window").height;
  
  // State for toggling between signup and login modes
  const [signup, setSignup] = useState(true)
  
  // Redux state selectors
  const user = useSelector((state: RootState) =>
    state.user.currentUser === null ? null : state.user.currentUser
  );
  const isLoading = useSelector((state: RootState) =>
    state.user.isFetching === null ? null : state.user.isFetching
  );
  const errorMessage = useSelector((state: RootState) =>
    state.user.error === null ? null : state.user.error
  );
  
  // Local state management
  const [toast, setToast] = useState(true);
  const dispatch = useDispatch();
  const [suggestions, setSuggestions] = useState([])
  const [addressFocus, setAddressFocus] = useState(false)
  const [googlePlaceSelected, setGooglePlaceSelected] = useState('')
  const { showToast } = useToast()

  const [confirmPassword, setConfirmPassword] = useState<string>()

  // Form values state
  const [values, setValues] = useState<User>({
    address: "",
    email: "",
    fullname: "",
    phoneNumber: "",
    password: "",
  });

  // Terms and conditions state
  const [terms, setTerms] = useState<boolean>(true);
  
  // Trial and error: Loading state management
  // const [isLoading, setIsLoading] = useState()

  // Form input change handler
  const onChange = (name: string, e: string) => {
    setValues((prevValues) => ({ ...prevValues, [name]: e }));
  };

  // Terms checkbox change handler
  const onValueChange = (e: boolean) => {
    setTerms(e);
  };

  // Trial and error: Auto-navigation on user state change
  // useEffect(() => {
  //   if (user) {
  //     router.replace("/(auth)/permissions");
  //   }
  // }, [user, router]);

  // Form submission handler
  const handleSubmit = async () => {
    // Trial and error: Direct navigation
    // router.replace('/(auth)/permissions')
    try {
      if (signup) {
        if (terms) {
          // Validate required fields
          if (!values.fullname || !values.email || !values.phoneNumber || !values.password) {
            showToast('Please fill in all the required fields.', 'error')
            console.log("Please fill in all the required fields.");
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(values.email)) {
            showToast('Invalid email format.', 'error')
            console.log("Invalid email format.");
            return;
          }
          
          // Validate phone number format
          const phoneRegex = /^\+?([0-9]{1,3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
          if (!phoneRegex.test(values.phoneNumber)) {
            console.error("Invalid phone number format.");
            return;
          }
          
          // Validate address selection
          if (!googlePlaceSelected) {
            showToast('Please select an address.', 'error')
            console.log('Address was not selected')
            return
          } else {
            console.log('i was selected')
          }
          
          // Validate password strength
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).{8,}$/;
          if (!passwordRegex.test(values.password)) {
            showToast('Password must be at least 8 characters, including uppercase, lowercase, number, and special character.', 'error')
            console.log("Password must be at least 8 characters, including uppercase, lowercase, number, and special character.");
            return;
          }
          
          // Validate password confirmation
          if (values.password !== confirmPassword) {
            showToast('Passwords do not match.', 'error')
            console.log("Passwords do not match.");
            return;
          }

          // Register user and handle post-registration flow
          await register(dispatch, { ...values });
          if (user?.id && user?.token) {
            await getEmergencyContacts(dispatch, user.id, user.token);
          }
          showToast('Registration successful!', 'success')
          router.replace("/(auth)/permissions");
        } else {
          showToast("Please accept our terms and conditions.", "error")
          console.log("Please accept our terms and conditions.")
        }
      } else {
        if (terms) {
          // Login validation
          if (!values.email || !values.password) {
            showToast("Please fill in all the required fields.", 'error')
            console.log("Please fill in all the required fields.");
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(values.email)) {
            showToast("Invalid email format.", 'error')
            console.log("Invalid email format.");
            return;
          }

          // Trial and error: Password validation for login
          // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).{8,}$/;
          // if (!passwordRegex.test(values.password)) {
          //   console.error("Password must be at least 8 characters, including uppercase, lowercase, number, and special character.");
          //   return;
          // }

          // Login user and handle post-login flow
          const data = await login(dispatch, values)
          console.log('testing')
          if (data?.id && data?.token) {
            await getEmergencyContacts(dispatch, data.id, data.token);
          }
          showToast('Login successful', 'success')
          router.replace('/(auth)/permissions')
        } else {
          console.error("Please accept our terms and conditions.")
        }
      }
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
        {/* Trial and error: Error toast component */}
        {/* <View
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
              <Ionicons name="checkmark-circle-outline" size={24} color="#4ADE80" />
              <Ionicons name="close-circle-outline" size={24} color="#F87171" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#7a7a7a", fontSize: 15, lineHeight: 20 }}>
                Invalid Credentials!
              </Text>
            </View>
          </View> */}
          
        {/* Screen title */}
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: "#7a7a7a",
              fontWeight: "700",
              fontSize: 20,
              lineHeight: 30,
            }}
          >
            Enter your info to {signup ? 'register' : 'login'}
          </Text>
        </View>

        {/* Form container */}
        <LinearGradient
          colors={["#161616", "#000000"]}
          style={{
            marginTop: 36,
            borderRadius: 32,
            paddingBottom: 32,
            paddingHorizontal: 16,
          }}
        >
          {/* Conditional form fields based on signup/login mode */}
          {signup ? <CustomInput
            onChange={(e) => onChange("fullname", e)}
            placeholder="Kurosaki Ichigo"
            keyboardType="default"
            value={values["fullname"]}
          /> : null}
          <CustomInput
            onChange={(e) => onChange("email", e)}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={values["email"]}
          />
          {signup ? <><CustomInput
            onChange={(e) => onChange("phoneNumber", e)}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={values["phoneNumber"]}
          />
            <CustomInput
              onChange={(e) => onChange("address", e)}
              onFocus={() => setAddressFocus(true)}
              ref={addressInput}
              // onBlur={() =>setAddressFocus(false)}
              onBlur={() => setAddressFocus(false)}
              placeholder="Home address"
              keyboardType="default"
              value={googlePlaceSelected.length > 0 ? googlePlaceSelected : values["address"]}
            />
            {/* Address suggestions list */}
            {values.address && suggestions.length > 0 && addressFocus ? <FlatList
              keyboardShouldPersistTaps='handled'
              data={suggestions}
              renderItem={({ item, index }) => (
                <TouchableOpacity key={item?.placePrediction?.placeId} onPress={() => {
                  // onChange("address", item.placePrediction.text.text)
                  setGooglePlaceSelected(item.placePrediction.text.text)
                  addressInput.current?.blur()
                  // setAddressFocus(false)
                  // setSuggestions([])
                }}>
                  <Text style={{ color: '#aaa', padding: 10 }}>{item.placePrediction.text.text}</Text>
                </TouchableOpacity>
              )}
            /> : null}
            {/* Additional suggestions display */}
            {suggestions.map((item, index) => (
            <TouchableOpacity key={item?.placePrediction?.placeId} onPress={() => {
              onChange("address", item.placePrediction.text.text)
              setSuggestions([])
            }}>
              <Text style={{color: '#aaa', padding: 10}}>{item.placePrediction.text.text}</Text>
            </TouchableOpacity>
          ))}

          </> : null}
          {/* Password input */}
          <CustomInput
            onChange={(e) => onChange("password", e)}
            placeholder="Password"
            secureTextEntry={true}
            // textContentType="none"
            // keyboardAppearance="dark"
            style={{
              color: '#e9e9e9',
              backgroundColor: 'transparent'
            }}
            // importantForAutofill="no"
            value={values["password"]}
          />
          {/* Confirm password input (signup only) */}
          {signup ? <CustomInput onChange={(e) => setConfirmPassword(e)} value={confirmPassword} secureTextEntry={true} placeholder="Confirm Password" /> : null}
          {/* Terms and conditions checkbox (signup only) */}
          {signup ? <View
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
          </View> : null}
          {/* Submit button and mode toggle */}
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
              {signup ? <Text
                style={{
                  color: "#7a7a7a",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 22.5,
                }}
              >
                {isLoading ? <Spinner /> : 'SUBMIT AND REGISTER'}
              </Text> :
                <Text
                  style={{
                    color: "#7a7a7a",
                    fontSize: 15,
                    fontWeight: "500",
                    lineHeight: 22.5,
                  }}
                >
                  {isLoading ? <Spinner /> : 'LOGIN'}
                </Text>}
            </TouchableOpacity>
            <Text onPress={() => setSignup(!signup)} style={{
              color: "#7a7a7a",
              fontSize: 15,
              fontWeight: "500",
              lineHeight: 22.5,
              marginTop: 12
            }}>{signup ? 'Already have an account? Sign in' : "Don't have an account? Reister here"}</Text>
            {/* </Link> */}
          </View>
        </LinearGradient>

        {/* Terms and conditions footer */}
        <View
          style={{
            marginTop: 26,
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
