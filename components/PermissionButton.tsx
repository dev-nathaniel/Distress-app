import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

export default function PermissionButton({ text, requestPermission }) {
  return (
    // <Link href={"/(auth)/selectContacts"} asChild>
    <TouchableOpacity onPress={requestPermission}>
      <LinearGradient
        colors={["transparent", "#171717", "transparent"]}
        end={[1, 0]}
        start={[0, 1]}
        style={{
          borderRadius: 12,
          flexDirection: "row",
          gap: 16,
          paddingVertical: 16,
          paddingHorizontal: 12,
          marginBottom: 27,
        }}
      >
        <View>
          <Image source={require("@/assets/images/important.png")} />
        </View>
        <Text style={{ color: "#7a7a7a", fontSize: 15, lineHeight: 20.5 }}>
          {text}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
    // </Link>
  );
}

const styles = StyleSheet.create({});
