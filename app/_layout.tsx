import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "react-native-gesture-handler";
import { persistor, RootState, store } from "@/redux/store";
import { Provider, useSelector } from "react-redux";

import { useColorScheme } from "@/components/useColorScheme";
import { PersistGate } from "redux-persist/integration/react";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <RootLayoutNav />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

function RootLayoutNav() {
  const user = useSelector((state: RootState) =>
    state.user.currentUser === null ? null : state.user.currentUser
  );
  console.log(user);

  useEffect(() => {
    if (user) {
      router.replace("/(screens)/homeIndex");
    } else {
      router.replace("/(auth)/authIndex");
    }
  }, [user]);

  return <Slot />;

  {
    /* <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          <Stack.Screen name="(screens)" options={{ headerShown: false }} />

          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack> */
  }
}