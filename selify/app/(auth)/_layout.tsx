import { Stack } from "expo-router/stack";

const auth = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="Login" />
      <Stack.Screen name="register" />
      {/* <Stack.Screen name="ForgotPassword" />
            <Stack.Screen name="ResetPassword" /> */}
      <Stack.Screen name="Onboarding" />
    </Stack>
  );
};
export default auth;
