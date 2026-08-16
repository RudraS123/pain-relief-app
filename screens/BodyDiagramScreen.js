//useState is a React "hook" — a special function that gives a component memory. Without it, every time your component re-renders, it would forget everything (like which region was tapped).
import { useState } from "react";
//Alert triggers the native pop-up alert box on the phone
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
//imports the SVG components from the library you installed.
import Svg, { Circle, Rect } from "react-native-svg";

// Define each tappable region: its shape, position, size, and what body part it represents.
// This array is your single source of truth for the diagram — add more regions here later.
const REGIONS = [
  {
    id: 1,
    name: "shoulder",
    side: "right",
    shape: "circle",
    cx: 120,
    cy: 80,
    r: 20,
  },
  {
    id: 2,
    name: "shoulder",
    side: "left",
    shape: "circle",
    cx: 220,
    cy: 80,
    r: 20,
  },
  {
    id: 3,
    name: "lower back",
    side: null,
    shape: "rect",
    x: 145,
    y: 180,
    width: 50,
    height: 40,
  },
  {
    id: 4,
    name: "knee",
    side: "right",
    shape: "circle",
    cx: 130,
    cy: 320,
    r: 18,
  },
];
// a component function that receives navigation as a prop, letting it move to other screens.
export default function BodyDiagramScreen({ navigation }) {
  // Tracks which region the user has tapped, so we can highlight it
  // and show the confirmation step (built in Step 6)
  const [selectedRegion, setSelectedRegion] = useState(null);

  //A function that takes whichever region object was tapped and stores it in state.
  const handleRegionTap = (region) => {
    setSelectedRegion(region);
  };

  const handleConfirm = () => {
    if (!selectedRegion) {
      Alert.alert("Select an area", "Please tap a body part first.");
      return;
    }
    // Pass the selected region's data forward to the next screen
    navigation.navigate("VideoPlayer", { bodyPartId: selectedRegion.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap where it hurts</Text>
      <Svg height="400" width="340" style={styles.diagram}>
        {/* A simple outline rectangle standing in for the body silhouette */}
        <Rect
          x="100"
          y="20"
          width="140"
          height="360"
          rx="30"
          fill="#f0f0f0"
          stroke="#999"
        />
        //map() is a JavaScript array method that transforms every item in an
        array into something new — here, transforming each region object into a
        rendered SVG shape.
        {REGIONS.map((region) => {
          const isSelected = selectedRegion?.id === region.id;
          //condition ? valueIfTrue : valueIfFalse. If this region is selected, color it blue; otherwise, a light red. This is what makes the tapped shape visually change color.
          const fillColor = isSelected ? "#2563eb" : "#fca5a5";

          if (region.shape === "circle") {
            return (
              <Circle
                key={region.id}
                cx={region.cx}
                cy={region.cy}
                r={region.r}
                fill={fillColor}
                onPress={() => handleRegionTap(region)}
              />
            );
          }
          return (
            <Rect
              key={region.id}
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              fill={fillColor}
              onPress={() => handleRegionTap(region)}
            />
          );
        })}
      </Svg>
      {selectedRegion && (
        <Text style={styles.selectedText}>
          Selected: {selectedRegion.side ? `${selectedRegion.side} ` : ""}
          {selectedRegion.name}
        </Text>
      )}
      //button that triggers handleConfirm (defined earlier), closing out the
      component.
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm Area</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 40 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  diagram: { marginBottom: 16 },
  selectedText: { fontSize: 16, marginBottom: 16, fontWeight: "600" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
