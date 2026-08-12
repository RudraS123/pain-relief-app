// NavigationContainer: wraps the ENTIRE app. You only ever have one of these,
// at the very top level. It manages overall navigation state — which screen
// is currently active, and the history of screens the user has moved through.
import { NavigationContainer } from "@react-navigation/native";

// createNativeStackNavigator: a function that gives us the "stack of cards"
// navigation pattern — new screens push on top, back button pops them off.
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import the actual screen components we built
import BodyDiagramScreen from "./screens/BodyDiagramScreen";
import SignInScreen from "./screens/SignInScreen";
import VideoPlayerScreen from "./screens/VideoPlayerScreen";

// Calling createNativeStackNavigator() gives us back an object containing
// two things we'll use below: Stack.Navigator and Stack.Screen
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* initialRouteName tells the app which screen to show first on launch */}
      <Stack.Navigator initialRouteName="SignIn">
        {/* Each Stack.Screen is a REGISTRATION — it links a string name
            (used elsewhere via navigation.navigate('SignIn')) to the actual
            component that should render when that name is navigated to. */}
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="BodyDiagram" component={BodyDiagramScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
