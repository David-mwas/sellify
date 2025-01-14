import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router/stack";
import { OnboardingProvider } from "@/contexts/OnBoardingContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "../global.css";
import { UserProvider } from "@/contexts/userContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <AuthProvider>
       <QueryClientProvider client={queryClient}>
      <UserProvider>
        <OnboardingProvider>
          <ThemeProvider>
            <Stack
              screenOptions={{ headerShown: false, animation: "simple_push" }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(modals)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </OnboardingProvider>
      </UserProvider>
       </QueryClientProvider>
    </AuthProvider>
  );
}
