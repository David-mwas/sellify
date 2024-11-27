import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";

type LocationHookReturn = {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  isLocationLoading: boolean;
};

export function useLocation(): LocationHookReturn {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocationLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getCurrentLocation() {
      setIsLoading(true);

      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg(
          "Oops, this will not work on Snack in an Android Emulator. Try it on your device!"
        );
        setIsLoading(false);
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg("An error occurred while fetching the location");
      } finally {
        setIsLoading(false);
      }
    }

    getCurrentLocation();
  }, []);

  return { location, errorMsg, isLocationLoading };
}
