import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
type PushTokenHookReturn = {
  pushToken: string | null;
  errorMsg: string | null;
  isLoading: boolean;
};

export function usePushNotificationToken(): PushTokenHookReturn {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      setIsLoading(true);
      if (Device.isDevice) {
        try {
          // Check for permissions
          const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          // Request permissions if not already granted
          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== "granted") {
            setErrorMsg("Permission to receive notifications was denied");
            setIsLoading(false);
            return;
          }

          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;
          if (!projectId) {
            handleRegistrationError("Project ID not found");
          }

          // Get the push token
          const { data: token } = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          if (token) {
            setPushToken(token!);
          }

          // For Android: Set notification channel
          if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
              name: "default",
              importance: Notifications.AndroidImportance.MAX,
            });
          }
        } catch (error) {
          console.error("Error fetching push token:", error);
          setErrorMsg(
            "An error occurred while fetching the push token " + error
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setErrorMsg("Must use physical device for Push Notifications");
        setIsLoading(false);
      }
    }

    registerForPushNotificationsAsync();
  }, []);

  return { pushToken, errorMsg, isLoading };
}
