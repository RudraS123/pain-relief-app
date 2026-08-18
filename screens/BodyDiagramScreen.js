import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal, //popup overlay component. use one for confirmation, one for the description text box.
  Platform, //lets you write code that behaves differently on iOS vs Android, since keyboard handling differs slightly between them.
  StyleSheet,
  Text,
  TextInput, //the actual text box the user types their problem description into.
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import { supabase } from "../lib/supabase";

//definitions of the tappable body regions.
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

// Two separate modals: one for "is this the right area?",
// one for the free-text description. Only one shows at a time.
export default function BodyDiagramScreen({ navigation }) {
  //Which body part did the user tap?
  const [selectedRegion, setSelectedRegion] = useState(null);
  //Should the confirmation popup show right now?
  const [confirmVisible, setConfirmVisible] = useState(false);
  //Should the text-box popup show right now?
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  //What has the user typed so far?
  const [description, setDescription] = useState("");
  //Is a save request currently in progress?
  const [saving, setSaving] = useState(false);

  //When a shape is tapped: remember which region it was, and immediately flip on the confirmation modal. Two state updates,
  // one function — this is the "tap → confirm modal appears" transition from your flow diagram.
  const handleRegionTap = (region) => {
    setSelectedRegion(region);
    setConfirmVisible(true);
  };

  //User taps "Yes" on the confirmation modal: hide that modal, show the description modal instead. Notice these two calls happen in the same function —
  //from the user's perspective, one modal smoothly replaces the other.
  const handleConfirmYes = () => {
    setConfirmVisible(false);
    setDescriptionVisible(true);
  };

  //If the user says "No, retry": hide the confirmation modal and clear the selected region, so the diagram returns to its original unselected state, ready for another tap.
  const handleConfirmNo = () => {
    setConfirmVisible(false);
    setSelectedRegion(null);
  };

  const handleSubmitDescription = async () => {
    setSaving(true); //lip the "in progress" flag on, so the Submit button can show "Saving..." and disable itself (prevents double-submits).

    // Get the currently signed-in user's ID from Supabase's auth session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    //writes a new row into your pain_reports table. The object's keys (user_id, body_part_id, description) must exactly match your table's column names.
    const { error } = await supabase.from("pain_reports").insert({
      user_id: user?.id,
      body_part_id: selectedRegion.id,
      description: description,
    });

    setSaving(false); //save attempt finished (whether it succeeded or failed), so turn the "in progress" flag back off.

    //if something went wrong, show an alert and stop here —
    // the return means the code below (closing the modal, navigating away) never runs, so the user stays on this screen and can try again.
    if (error) {
      Alert.alert("Something went wrong", error.message);
      return;
    }
    //no error: close the description modal and navigate to VideoPlayer, passing the body part's id along — same data-passing mechanism from Step 5.
    setDescriptionVisible(false);
    navigation.navigate("VideoPlayer", { bodyPartId: selectedRegion.id });
  };

  //nested ternary: the outer one checks if a region is even selected; the inner one checks if that region has a side value.
  const regionLabel = selectedRegion
    ? `${selectedRegion.side ? selectedRegion.side + " " : ""}${selectedRegion.name}`
    : "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap where it hurts</Text>
      <Svg height="400" width="340" style={styles.diagram}>
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
          const fillColor = isSelected ? "#2563eb" : "#fca5a5";
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
      {/* --- Confirmation Modal --- */}
      //actual on/off switch. This directly connects your state to what's shown
      on screen — exactly the "state drives UI" idea from before. //modal fades
      in/out rather than sliding
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
      {/* --- Description Chat Box Modal --- */}
      //the modal slides up from the bottom instead of fading
      <Modal visible={descriptionVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              What kind of problem are you facing in your {regionLabel}?
            </Text>
            //he input's displayed value always comes from state (value=
            {description}), and every keystroke updates that same state
            (onChangeText={setDescription})
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Describe your problem..."
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              //can just read description directly
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
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonPrimaryText: { color: "#fff", fontWeight: "600" },
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
