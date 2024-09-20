import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputChangeEventData,
  View,
} from "react-native";
import React from "react";

export default function CustomInput({
  onChange,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  value,
}: {
  onChange: (e: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "words" | "sentences" | undefined;
  value: string | undefined;
}) {
  return (
    <View style={{ position: "relative", marginHorizontal: 32, marginTop: 32 }}>
      <TextInput
        onChangeText={onChange}
        placeholder={placeholder}
        value={value}
        placeholderTextColor={"#7a7a7a"}
        style={{
          // paddingLeft: 32,
          paddingBottom: 16,
          color: "#e9e9e9",
          // backgroundColor: "white",
          //   paddingVertical: 19,
          borderBottomColor: "#363636",
          borderBottomWidth: 1,
        }}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
