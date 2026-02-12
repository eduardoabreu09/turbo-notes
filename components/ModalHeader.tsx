import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

export default function ModalHeader() {
  const activeContent = useThemeColor("activeContent");

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: activeContent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 20,
  },
  bar: {
    width: 100,
    height: 5,
    borderRadius: 5,
  },
});
