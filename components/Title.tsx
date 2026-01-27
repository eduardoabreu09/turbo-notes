import { theme } from "@/constants/theme";
import { TextProps, ThemedText } from "./Themed";

export default function Title({ ...otherProps }: TextProps) {
  return (
    <ThemedText fontSize={theme.fontSize34} fontWeight="bold" {...otherProps} />
  );
}
