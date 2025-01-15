import { useContext } from "react";
import { Tabs } from "expo-router";
import { View, ActivityIndicator, StatusBar, SafeAreaView } from "react-native";
import { AuthContext } from "@/contexts/AuthContext"; // For user authentication
import { OnboardingContext } from "@/contexts/OnBoardingContext"; // For onboarding status
import { ThemeContext } from "@/contexts/ThemeContext"; // For theme management
import { Colors } from "@/constants/Colors"; // Custom color palette
import FontAwesome from "@expo/vector-icons/FontAwesome";
import OnBoarding from "../(auth)/Onboarding";
import Login from "../(auth)/Login";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const authContext = useContext(AuthContext);
  const onboardingContext = useContext(OnboardingContext);
  const themeContext = useContext(ThemeContext);

  if (!authContext || !onboardingContext || !themeContext) {
    throw new Error(
      "AuthContext, OnboardingContext, and ThemeContext must be used within their providers"
    );
  }

  const { userToken, isLoading: isAuthLoading } = authContext;
  const { isOnboardingCompleted } = onboardingContext;
  const { isDarkMode } = themeContext;

  // Set theme-based colors
  const activeTintColor = isDarkMode
    ? Colors.dark.tabIconSelected
    : Colors.light.tabIconSelected;
  const inactiveTintColor = isDarkMode
    ? Colors.dark.tabIconDefault
    : Colors.light.tabIconDefault;
  const backgroundColor = isDarkMode
    ? Colors.dark.background
    : Colors.light.background;
  const headerBackgroundColor = isDarkMode
    ? Colors.dark.headerBackground
    : Colors.light.headerBackground;
  const headerTextColor = isDarkMode
    ? Colors.dark.headerText
    : Colors.light.headerText;
  // Get current theme

  if (isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: backgroundColor,
        }}
      >
        <ActivityIndicator size="large" color={activeTintColor} />
      </View>
    );
  }
  if (!userToken && !isOnboardingCompleted) {
    // setIsLoading(false);

    return <OnBoarding />;
    // router.replace("/(auth)/OnBoarding");
  }
  if (isOnboardingCompleted && !userToken) {
    return <Login />;
    // router.replace("/(auth)/Login");
  }

  return (
    <SafeAreaView style={{ backgroundColor: backgroundColor, flex: 1 }}>
      {/* StatusBar with dynamic theme */}
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={headerBackgroundColor}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTintColor,
          tabBarHideOnKeyboard: true,
          tabBarInactiveTintColor: inactiveTintColor,
          tabBarInactiveBackgroundColor: backgroundColor,
          tabBarActiveBackgroundColor: backgroundColor,
          headerStyle: { backgroundColor: headerBackgroundColor },
          headerTintColor: headerTextColor,
          headerShown: false,
          tabBarStyle: {
            height: 60,
            // borderTopWidth: 0,
            elevation: 5,
            shadowColor: "#f1f1f1",
            shadowOffset: { width: 2, height: 5 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },

          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            animation: "shift",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="products"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="add"
          options={({ navigation }) => ({
            title: "Post product",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="plus-circle"
                color={color}
                size={30}
              />
            ),
          })}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: "account",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
