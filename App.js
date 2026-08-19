import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { supabase } from "./lib/supabase";
import BodyDiagramScreen from "./screens/BodyDiagramScreen";
import SignInScreen from "./screens/SignInScreen";
import VideoPlayerScreen from "./screens/VideoPlayerScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  // Tracks whether we know yet if a session exists (avoids a flash of
  // the Sign In screen before Supabase has had a chance to check)
  const [checkingSession, setCheckingSession] = useState(true);
  // Tracks whether a user is currently signed in
  const [session, setSession] = useState(null);

  useEffect(() => {
    // On app load, check if a session already exists (e.g. user was
    // already signed in from a previous visit)
    //checks once, immediately on app load, whether a session already exists (useful if the user closes and reopens the app while still signed in).
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    // Subscribe to ANY future auth state change — sign in, sign out,
    // token refresh, OAuth redirect completing, all of it funnels here
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    // Cleanup: stop listening when the component unmounts, to avoid
    // memory leaks / duplicate listeners
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          // User IS signed in — show the main app screens
          <>
            <Stack.Screen name="BodyDiagram" component={BodyDiagramScreen} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
          </>
        ) : (
          // User is NOT signed in — only show Sign In
          <Stack.Screen name="SignIn" component={SignInScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
