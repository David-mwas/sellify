import { Stack } from "expo-router/stack";

export const auth = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="Register" />
      {/* <Stack.Screen name="ForgotPassword" />
            <Stack.Screen name="ResetPassword" /> */}
      <Stack.Screen name="Onboarding" />
    </Stack>
  );
};
