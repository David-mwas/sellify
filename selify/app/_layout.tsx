import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router/stack";
import { OnboardingProvider } from "@/contexts/OnBoardingContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "../global.css";

export default function Layout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false, animation: "flip" }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(modals)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}
