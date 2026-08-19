import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function SignInScreen() {
  // What the user has typed into each field so far
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Controls which mode the screen is in: true = "Create Account" mode,
  // false = "Sign In" mode. This single flag drives the title text,
  // button label, which Supabase function gets called, and the toggle
  // link text below — one piece of state, multiple UI elements react to it.
  const [isSignUp, setIsSignUp] = useState(false);

  // True while an auth request is in flight — used to disable the button
  // and show "Please wait..." so the user can't accidentally submit twice
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    setLoading(true);

    // Ternary picks which Supabase function to call based on the current
    // mode: signUp() creates a brand-new account, signInWithPassword()
    // only works against an account that already exists
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    // If Supabase returned an error, show it and stop here — don't run
    // any of the success logic below
    if (error) {
      Alert.alert(
        isSignUp ? "Sign up failed" : "Sign in failed",
        error.message,
      );
      return;
    }

    // Handles a real-world Supabase detail: depending on project settings,
    // a new sign-up might require email confirmation before a session
    // actually exists. If that's the case here, data.session will be
    // missing even though signUp() itself didn't error out.
    if (isSignUp && !data.session) {
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. Please verify your email, then sign in.",
      );
      // Flip back to Sign In mode so the screen is ready for when
      // the user returns after confirming their email
      setIsSignUp(false);
    }

    // NOTE: if a session DOES exist (normal sign-in succeeded, or
    // sign-up didn't require confirmation), we don't navigate manually
    // here. App.js listens for auth state changes globally and moves
    // the user forward automatically once a session appears.
  };

  const handleGoogleSignIn = async () => {
    // Kicks off the OAuth redirect flow — the user gets sent to
    // Google's own login page, then redirected back once they're done.
    // Like above, App.js's auth listener handles what happens next,
    // not this function directly.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      Alert.alert("Google sign in failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* App logo, loaded from a local file bundled into the app */}
      <Image
        source={require("../assets/images/logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title text changes based on which mode we're in */}
      <Text style={styles.title}>
        {isSignUp ? "Create Account" : "Welcome Back"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none" // prevents auto-capitalizing the first letter, since emails are case-sensitive-ish and shouldn't be auto-formatted
        keyboardType="email-address" // shows a keyboard layout optimized for typing emails (@ symbol easily accessible, etc.)
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // masks input as dots, standard password field behavior
      />

      {/* Main action button — label and behavior both depend on isSignUp */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleEmailAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
        </Text>
      </TouchableOpacity>

      {/* Tapping this flips isSignUp to its opposite value, switching
          the whole screen between Sign In and Sign Up modes */}
      <TouchableOpacity
        onPress={() => setIsSignUp(!isSignUp)}
        style={styles.toggleLink}
      >
        <Text style={styles.toggleText}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Visual divider separating email/password auth from the
          Google OAuth option below */}
      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

// Pulled from the Viva Stretch logo's color palette — defined once here
// so both the styles below and any future tweaks stay consistent
const TEAL = "#2DD9D9";
const GREEN = "#4ADE80";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centers content vertically
    alignItems: "center", // centers content horizontally
    backgroundColor: "#0B0B0B", // matches the logo's black background
    paddingHorizontal: 24,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 28,
  },
  input: {
    width: "75%", // narrower than full-width, per the redesign request
    maxWidth: 280, // caps how wide it gets on larger screens/tablets
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "#fff", // typed text color
    backgroundColor: "#151515", // slightly lighter than the page background, so the input is visibly distinct
  },
  button: {
    width: "75%",
    maxWidth: 280,
    backgroundColor: TEAL, // primary action = teal, matching the logo's main color
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#0B0B0B", // dark text on the bright teal button for contrast/readability
    fontSize: 16,
    fontWeight: "700",
  },
  toggleLink: { marginBottom: 20 },
  toggleText: {
    color: GREEN, // secondary action = green, matching "STRETCH" in the logo
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    width: "75%",
    maxWidth: 280,
    height: 1,
    backgroundColor: "#2a2a2a", // subtle, low-contrast line — meant to be noticed, not to stand out
    marginBottom: 20,
  },
  googleButton: {
    width: "75%",
    maxWidth: 280,
    backgroundColor: "transparent", // outlined style, rather than a solid fill, to visually rank it below the main Sign In button
    borderWidth: 1,
    borderColor: GREEN,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  googleButtonText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "600",
  },
});
