import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import { supabase } from "../lib/supabase";

const REGIONS = [
  {
    id: 1,
    name: "shoulder",
    side: "right",
    shape: "circle",
    cx: 195,
    cy: 90,
    r: 18,
  },
  {
    id: 2,
    name: "shoulder",
    side: "left",
    shape: "circle",
    cx: 145,
    cy: 90,
    r: 18,
  },
  {
    id: 3,
    name: "lower back",
    side: null,
    shape: "rect",
    x: 150,
    y: 145,
    width: 40,
    height: 35,
  },
  {
    id: 4,
    name: "knee",
    side: "right",
    shape: "circle",
    cx: 205,
    cy: 300,
    r: 16,
  },
];

export default function BodyDiagramScreen({ navigation }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleRegionTap = (region) => {
    setSelectedRegion(region);
    setConfirmVisible(true);
  };

  const handleConfirmYes = () => {
    setConfirmVisible(false);
    setDescriptionVisible(true);
  };

  const handleConfirmNo = () => {
    setConfirmVisible(false);
    setSelectedRegion(null);
  };

  const handleSubmitDescription = async () => {
    if (!selectedRegion) {
      Alert.alert("Something went wrong", "Please select a body part again.");
      setDescriptionVisible(false);
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("pain_reports").insert({
      user_id: user?.id,
      body_part_id: selectedRegion.id,
      description: description,
    });

    setSaving(false);

    if (error) {
      Alert.alert("Something went wrong", error.message);
      return;
    }

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      // App.js's onAuthStateChange listener will detect this automatically
      // and switch the app back to showing the Sign In screen
    };

    setDescriptionVisible(false);
    navigation.navigate("VideoPlayer", { bodyPartId: selectedRegion.id });
  };

  const regionLabel = selectedRegion
    ? `${selectedRegion.side ? selectedRegion.side + " " : ""}${selectedRegion.name}`
    : "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap where it hurts</Text>

      <Svg height="400" width="340" style={styles.diagram}>
        <Circle
          cx="170"
          cy="45"
          r="20"
          fill="none"
          stroke="#999"
          strokeWidth="2"
        />
        <Rect
          x="145"
          y="70"
          width="50"
          height="120"
          rx="15"
          fill="none"
          stroke="#999"
          strokeWidth="2"
        />
        <Line
          x1="150"
          y1="85"
          x2="95"
          y2="180"
          stroke="#999"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Line
          x1="190"
          y1="85"
          x2="245"
          y2="180"
          stroke="#999"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Line
          x1="158"
          y1="188"
          x2="135"
          y2="340"
          stroke="#999"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Line
          x1="182"
          y1="188"
          x2="205"
          y2="340"
          stroke="#999"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {REGIONS.map((region) => {
          const isSelected = selectedRegion?.id === region.id;
          const fillColor = isSelected ? "#2DD9D9" : "rgba(74, 222, 128, 0.6)";
          const Shape = region.shape === "circle" ? Circle : Rect;
          const shapeProps =
            region.shape === "circle"
              ? { cx: region.cx, cy: region.cy, r: region.r }
              : {
                  x: region.x,
                  y: region.y,
                  width: region.width,
                  height: region.height,
                };

          return (
            <Shape
              key={region.id}
              {...shapeProps}
              fill={fillColor}
              onPress={() => handleRegionTap(region)}
            />
          );
        })}
      </Svg>

      {selectedRegion && (
        <Text style={styles.selectedText}>Selected: {regionLabel}</Text>
      )}

      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Is this the area of concern — your {regionLabel}?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={handleConfirmNo}
              >
                <Text style={styles.modalButtonSecondaryText}>No, retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleConfirmYes}
              >
                <Text style={styles.modalButtonPrimaryText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={descriptionVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              What kind of problem are you facing in your {regionLabel}?
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Describe your problem..."
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={handleSubmitDescription}
              disabled={saving}
            >
              <Text style={styles.modalButtonPrimaryText}>
                {saving ? "Saving..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 40 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  diagram: { marginBottom: 16 },
  selectedText: { fontSize: 16, marginBottom: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
  },
  modalText: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  modalButtonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalButtonPrimary: {
    backgroundColor: "#2DD9D9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonPrimaryText: { color: "#0B0B0B", fontWeight: "700" },
  modalButtonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalButtonSecondaryText: { color: "#333", fontWeight: "600" },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: "top",
  },
});
