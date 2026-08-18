import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { supabase } from "../lib/supabase";

export default function VideoPlayerScreen({ route }) {
  // This is where the data passed from BodyDiagramScreen's navigation.navigate('VideoPlayer', { bodyPartId: selectedRegion.id }) actually arrives
  const { bodyPartId } = route.params;

  // Three pieces of state: the videos themselves, whether we're still
  // loading them, and whether the fetch failed
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // useEffect runs this code automatically when the screen loads,
  // and again any time bodyPartId changes (e.g. if the user navigates
  // back and picks a different body part)
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("body_part_id", bodyPartId);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [bodyPartId]); //this array tells React "run this effect once when the screen first loads, and again any time bodyPartId changes."

  // Turns a normal YouTube watch URL into the special "embed" URL format
  // that WebView needs to actually render the player (not just a link)
  const getEmbedUrl = (youtubeUrl) => {
    //This function does simple string splitting — .split('v=') breaks the URL into two pieces around "v=", and [1] grabs the second piece (the actual video ID), which then gets inserted into the embed URL template.
    const videoId = youtubeUrl.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  //Three early-return checks (loading, errorMessage, videos.length === 0)
  if (loading) {
    return (
      <View style={styles.centered}>
        //React Native's built-in spinning loading indicator
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your exercises...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Something went wrong: {errorMessage}
        </Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No videos found for this area yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      //For each video object in your videos array,
      //renderItem defines what to draw — here, a title plus an embedded video player.
      renderItem={({ item }) => (
        <View style={styles.videoCard}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <View style={styles.videoWrapper}>
            <WebView
              source={{ uri: getEmbedUrl(item.url) }}
              style={styles.webview}
              allowsFullscreenVideo
            />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  errorText: { fontSize: 16, color: "#dc2626", textAlign: "center" },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
  videoCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  videoTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  videoWrapper: {
    height: 220,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: { flex: 1 },
});
