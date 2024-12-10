import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { apiUrl } from "@/constants/api";
import { AuthContext } from "./AuthContext";

export type UserProfile = {
  imageUrl: {
    url: string;
    publicId: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  listings: any[];
  messages: any[];
  expoPushToken: string;
  createdAt: string;
};

type UserContextType = {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);
  const { userToken } = auth || {};
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userToken) return;

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }

        const data = await response.json();
        setUserProfile(data.userProfile);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userToken]);

  return (
    <UserContext.Provider value={{ userProfile, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
