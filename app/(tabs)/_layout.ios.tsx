import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={{ selected: "house.fill", default: "house" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add-note">
        <Label>Add Note</Label>
        <Icon sf={{ selected: "plus.app.fill", default: "plus.app" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
