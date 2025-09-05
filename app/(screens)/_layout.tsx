import { View, Text } from "react-native";
// import React from "react";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="homeIndex" options={{ headerShown: false }} />
      <Stack.Screen name="monitor" options={{ headerShown: false }} />
    </Stack>
  );
}
