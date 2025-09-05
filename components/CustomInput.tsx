import {
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputChangeEventData,
  TextInputFocusEventData,
  TextStyle,
  View,
} from "react-native";
import React from "react";

export default function CustomInput({
  style,
  textContentType,
  ref,
  onBlur,
  onFocus,
  onChange,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  value,
  keyboardAppearance,
  importantForAutofill
}: {
  textContentType?:
    | 'none'
    | 'URL'
    | 'addressCity'
    | 'addressCityAndState'
    | 'addressState'
    | 'countryName'
    | 'creditCardNumber'
    | 'creditCardExpiration'
    | 'creditCardExpirationMonth'
    | 'creditCardExpirationYear'
    | 'creditCardSecurityCode'
    | 'creditCardType'
    | 'creditCardName'
    | 'creditCardGivenName'
    | 'creditCardMiddleName'
    | 'creditCardFamilyName'
    | 'emailAddress'
    | 'familyName'
    | 'fullStreetAddress'
    | 'givenName'
    | 'jobTitle'
    | 'location'
    | 'middleName'
    | 'name'
    | 'namePrefix'
    | 'nameSuffix'
    | 'nickname'
    | 'organizationName'
    | 'postalCode'
    | 'streetAddressLine1'
    | 'streetAddressLine2'
    | 'sublocality'
    | 'telephoneNumber'
    | 'username'
    | 'password'
    | 'newPassword'
    | 'oneTimeCode'
    | 'birthdate'
    | 'birthdateDay'
    | 'birthdateMonth'
    | 'birthdateYear'
    | 'cellularEID'
    | 'cellularIMEI'
    | 'dateTime'
    | 'flightNumber'
    | 'shipmentTrackingNumber'
    | undefined;
  ref?: React.Ref<TextInput>
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onChange: (e: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "words" | "sentences" | undefined;
  value: string | undefined;
  style?: StyleProp<TextStyle>;
  keyboardAppearance?: 'default' | 'light' | 'dark' | undefined;
  importantForAutofill?:
    | 'auto'
    | 'no'
    | 'noExcludeDescendants'
    | 'yes'
    | 'yesExcludeDescendants'
    | undefined;
}) {
  return (
    <View style={{ position: "relative", marginHorizontal: 32, marginTop: 32 }}>
      <TextInput
        ref={ref}
        onChangeText={onChange}
        placeholder={placeholder}
        value={value}
        textContentType={textContentType}
        placeholderTextColor={"#7a7a7a"}
        style={[{
          // paddingLeft: 32,
          paddingBottom: 16,
          color: "#e9e9e9",
          backgroundColor: "transparent",
          //   paddingVertical: 19,
          borderBottomColor: "#363636",
          borderBottomWidth: 1,
        }, style]}
        importantForAutofill={importantForAutofill}
        keyboardAppearance={keyboardAppearance}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
