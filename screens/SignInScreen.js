import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignInScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      //a tappable area that dims slightly when pressed, giving the user visual
      feedback. This is the "button."
      <TouchableOpacity
        style={styles.button}
        //push the screen registered under the name 'BodyDiagram' onto the stack.
        onPress={() => navigation.navigate("BodyDiagram")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
