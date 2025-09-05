import { View, Text } from "react-native";
// import React from "react";
import { Stack } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="authIndex" options={{ headerShown: false }} />
      <Stack.Screen name="permissions" options={{ headerShown: false }} />
      <Stack.Screen name="selectContacts" options={{ headerShown: false }} />
    </Stack>
  );
}
