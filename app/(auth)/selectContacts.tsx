import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as Contacts from "expo-contacts";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { getEmergencyContacts, updateUser } from "@/redux/apiCalls";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { api } from "@/axios";
import { useToast } from "@/context/ToastContext";
import React from "react";

export default function SelectContacts() {
  // State for managing contacts list
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const windowHeight = Dimensions.get("window").height;
  
  // State for selected emergency contacts
  const [selectedContacts, setSelectedContacts] = useState<Contacts.Contact[]>([]);
  const [lastContact, setLastContact] = useState<Contacts.Contact>();
  
  // State for contact search
  const [searchTerm, setSearchTerm] = useState("");
  
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
  
  // Trial and error: Debug logging
  // console.log(user);
  
  const { showToast } = useToast()
  const dispatch = useDispatch();

  // Filter contacts based on search term
  const filteredContacts = useCallback(() => {
    console.log(contacts[3])
    console.log(contacts[0]?.phoneNumbers?.[0])
    return contacts.filter(
      (contact) =>
        contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phoneNumbers?.[0]?.digits?.includes(searchTerm)
    );
  }, [contacts, searchTerm]);

  // Handle contact selection
  const selectContact = (newContact: Contacts.Contact) => {
    if (selectedContacts.length == 3) {
      setLastContact(newContact);
    }
    setSelectedContacts((prev: Contacts.Contact[]) => [...prev, newContact]);
    setContacts((prev: Contacts.Contact[]) =>
      prev.filter((contact) => contact.id !== newContact.id)
    );
  };

  // Handle contact deselection
  const deselectContact = (contactToRemove: Contacts.Contact) => {
    setSelectedContacts((prev: Contacts.Contact[]) =>
      prev.filter((contact) => contact.id !== contactToRemove.id)
    );
    setContacts((prev: Contacts.Contact[]) => [contactToRemove, ...prev]);
  };

  // Effect to request and load contacts on component mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === "granted") {
          const { data } = await Contacts.getContactsAsync();

          if (data.length > 0) {
            const contacts = data;
            // Trial and error: Debug logging
            // console.log(data);
            setContacts(data);
            setSelectedContacts([]);
          }
        }
      } catch (err) {
        if (err) {
          handleDeniedContactsPermission();
        }
      }
    })();
  }, []);

  // Effect to handle emergency contacts limit
  useEffect(() => {
    if (selectedContacts.length > 3) {
      Alert.alert(
        "Emergency Contacts Selected",
        "Please confirm you have selected 4 emergency contacts.",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => deselectContact(lastContact),
          },
          { text: "Yes", onPress: addEmergencyContacts },
        ]
      );
    }
  }, [selectedContacts]);

  // Add emergency contacts to user profile
  const addEmergencyContacts = async () => {
    try {
      const filteredSelectedContacts = selectedContacts.map((item) => {
        return {
          name: item.name,
          firstName: item.firstName,
          lastName: item.lastName,
          emails: item.emails?.map((item) => {
            return item.email;
          }),
          phoneNumbers: item.phoneNumbers?.map((item) => {
            return {
              number: item.number,
              digits: item.digits,
              countryCode: item.countryCode,
            };
          }),
        };
      });
      console.log(filteredSelectedContacts, 'data to be sent')
      if (user?.id && user?.token) {
        await api.put(`/user/${user.id}`, {emergencyContacts: filteredSelectedContacts}, {headers: {Authorization: `Bearer ${user.token}`}})
        await getEmergencyContacts(dispatch, user.id, user.token)
        // Trial and error: Alternative update method
        // await updateUser(dispatch, user._id, {
        //   emergencyContacts: filteredSelectedContacts,
        // });
        showToast('Emergency contacts successfully added!', 'success')
        navigateToHomeScreen();
      }
    } catch (err) {
      showToast('Something went wrong', 'error')
      deselectContact(lastContact)
      console.log(err.response);
    }
  };

  // Navigate to home screen
  const navigateToHomeScreen = () => {
    router.replace("/(screens)/homeIndex");
  };

  // Open device settings
  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  // Handle denied contacts permission
  const handleDeniedContactsPermission = () => {
    Alert.alert(
      "Contacts Permission Required",
      "This app needs access to your contacts. Please grant permission in the app settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openSettings },
      ]
    );
  };

  // Render the contacts selection screen
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#000000", "#161616", "#000000", "#161616"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: windowHeight,
        }}
      />
      <View style={{ flex: 1, marginHorizontal: 16 }}>
        {/* Emergency contacts container */}
        <View
          style={{
            backgroundColor: "#161616",
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 24,
          }}
        >
          {/* Local authorities section */}
          <View
            style={{
              borderColor: "#7a7a7a40",
              borderWidth: 1,
              borderStyle: "dashed",
              borderRadius: 32,
              paddingHorizontal: 8,
              paddingVertical: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View>
                <Image source={require("@/assets/images/authorities.png")} />
              </View>
              <View style={{ justifyContent: "space-between" }}>
                <Text
                  style={{ fontSize: 16, color: "#7a7a7a", lineHeight: 22 }}
                >
                  Local Authorities
                </Text>
                <Text
                  style={{ fontSize: 12, lineHeight: 16.5, color: "#7a7a7a40" }}
                >
                  911
                </Text>
              </View>
            </View>
            <View>
              <Text
                style={{ fontSize: 12, lineHeight: 16.5, color: "#7a7a7a40" }}
              >
                Added by default
              </Text>
            </View>
          </View>

          {/* Selected contacts list */}
          <View
            style={{
              backgroundColor: "#222222",
              borderRadius: 16,
              paddingVertical: 18,
              paddingHorizontal: 16,
              gap: 18,
              marginTop: 12,
            }}
          >
            {selectedContacts?.map((contact, index) => (
              <TouchableOpacity
                onPress={() => deselectContact(contact)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                key={index}
              >
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View>
                    <Image source={require("@/assets/images/person.png")} />
                  </View>
                  <View style={{ justifyContent: "space-between" }}>
                    <Text
                      style={{ fontSize: 16, lineHeight: 22, color: "#7a7a7a" }}
                    >
                      {contact.firstName} {contact.lastName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        lineHeight: 16.5,
                        color: "#7a7a7a40",
                      }}
                    >
                      {contact?.phoneNumbers?.[0]?.number}
                    </Text>
                  </View>
                </View>
                <View>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#7a7a7a",
                      width: 24,
                      height: 24,
                      borderRadius: 100,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        borderWidth: 1,
                        borderColor: "#7a7a7a",
                      }}
                    ></View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contacts search and list container */}
        <View
          style={{
            backgroundColor: "#161616",
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingTop: 12,
            flex: 1,
          }}
        >
          {/* Search input */}
          <View
            style={{
              backgroundColor: "#00000060",
              borderRadius: 18,
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              placeholder="Search your contacts"
              placeholderTextColor={"#7a7a7a40"}
              style={{ fontSize: 16, lineHeight: 21, color: "#e9e9e9" }}
              value={searchTerm}
              onChangeText={(e) => setSearchTerm(e)}
            />
          </View>

          {/* Contacts list */}
          <ScrollView style={{ flex: 1, paddingTop: 18 }}>
            {filteredContacts()?.map((contact, index) => (
              <TouchableOpacity
                onPress={() => selectContact(contact)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                  paddingHorizontal: 16,
                }}
                key={index}
              >
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View>
                    <Image
                      source={
                        contact.imageAvailable
                          ? contact.image
                          : require("@/assets/images/person.png")
                      }
                    />
                  </View>
                  <View style={{ justifyContent: "space-between" }}>
                    <Text
                      style={{ fontSize: 16, lineHeight: 22, color: "#7a7a7a" }}
                    >
                      {contact.firstName} {contact.lastName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        lineHeight: 16.5,
                        color: "#7a7a7a40",
                      }}
                    >
                      {contact?.phoneNumbers?.[0]?.number}
                    </Text>
                  </View>
                </View>
                <View>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#7a7a7a",
                      width: 24,
                      height: 24,
                      borderRadius: 100,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image source={require("@/assets/images/plus.png")} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
