import React, { useContext, useEffect } from "react";
import { SafeAreaView, Image, StyleSheet, Alert } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { OnboardingContext } from "@/contexts/OnBoardingContext";
import { router } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import Login from "./Login";
import { StatusBar } from "expo-status-bar";

const OnBoarding = () => {
  const authContext = useContext(AuthContext);
  const onboardingContext = useContext(OnboardingContext);

  if (!authContext || !onboardingContext) {
    throw new Error(
      "AuthContext and OnboardingContext must be used within their providers"
    );
  }
  const { userToken, isLoading: isAuthLoading } = authContext;
  const { isOnboardingCompleted, completeOnboarding } = onboardingContext;

  if (isOnboardingCompleted && !userToken) {
    return <Login />;
  }

  const handleComplete = async () => {
    await completeOnboarding();
    // Alert.alert("Onboarding Complete", "Redirecting to login...");
    router.replace("/(auth)/Login");
  };

  if (isOnboardingCompleted) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Onboarding
        onSkip={handleComplete}
        onDone={handleComplete}
        pages={[
          {
            backgroundColor: "rgba(197, 131, 67, 0.8)",
            image: (
              <Image
                source={require("../../assets/images/img2.png")}
                style={styles.image}
                resizeMode="cover"
              />
            ),
            title: "Welcome To Selify",
            subtitle:
              "Selify is a marketplace for selling what you don't need anymore",
            titleStyles: styles.title1,
            subTitleStyles: styles.subtitle1,
          },
          {
            backgroundColor: "rgba(243, 243, 243, 0.7)",
            image: (
              <Image
                source={require("../../assets/images/image2.png")}
                style={styles.image}
                resizeMode="cover"
              />
            ),
            title: "Choose what to Sell or Buy",
            subtitle:
              "View all products from other users and choose what you like or sell your own products",
            titleStyles: styles.title2,
            subTitleStyles: styles.subtitle2,
          },
          {
            backgroundColor: "rgba(197, 131, 67, 0.4)",
            image: (
              <Image
                source={require("../../assets/images/image1.png")}
                style={styles.image}
                resizeMode="cover"
              />
            ),
            title: "Chat with Buyers or Sellers",
            subtitle:
              "Send and receive messages between users for negotiations or inquiries in Realtime",
            titleStyles: styles.title3,
            subTitleStyles: styles.subtitle3,
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  title1: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 24,
  },
  subtitle1: {
    color: "#333",
    fontWeight: "semibold",
    fontSize: 20,
    textAlign: "center",
    paddingBottom: 10,
  },
  title2: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 24,
  },
  subtitle2: {
    color: "#333",
    fontWeight: "semibold",
    fontSize: 20,
    textAlign: "center",
    paddingBottom: 10,
  },
  title3: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 24,
  },
  subtitle3: {
    color: "#333",
    fontWeight: "semibold",
    fontSize: 20,
    textAlign: "center",
    paddingBottom: 10,
  },
});

export default OnBoarding;
