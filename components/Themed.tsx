import { FontFamily, Fonts, theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import {
  Pressable,
  PressableProps,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";
import Animated, { EntryOrExitLayoutType } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type ThemeProps = {
  color?: { light: string; dark: string };
};

type AnimatedProps = {
  animated?: boolean;
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
};

export type TextProps = ThemeProps & {
  fontSize?: TextStyle["fontSize"];
  fontWeight?: "light" | "normal" | "semibold" | "bold" | "medium" | 600;
  fontFamily?: FontFamily;
  italic?: boolean;
} & Text["props"] &
  AnimatedProps;

export type ViewProps = ThemeProps & View["props"] & AnimatedProps;

export type PressProps = PressableProps & {
  backgroundColor?: string;
} & AnimatedProps;

export type InputProps = TextInputProps &
  AnimatedProps & {
    ref?: React.Ref<TextInput>;
  };

export function ThemedText(props: TextProps) {
  const {
    style,
    fontSize = theme.fontSize16,
    fontWeight = "normal",
    fontFamily = "sans",
    italic,
    animated,
    color: themeColor,
    ...otherProps
  } = props;

  const color = useThemeColor("text");

  if (animated) {
    return (
      <Animated.Text
        style={[
          { color, fontSize, fontFamily: Fonts[fontFamily], fontWeight },
          style,
        ]}
        {...otherProps}
      />
    );
  }

  return (
    <Text
      style={[
        {
          color,
          fontSize,
          fontFamily: Fonts[fontFamily],
          fontWeight,
          fontStyle: italic ? "italic" : "normal",
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function ThemedView(props: ViewProps) {
  const { style, animated, ...otherProps } = props;
  const backgroundColor = useThemeColor("background");

  if (animated) {
    return (
      <Animated.View style={[{ backgroundColor }, style]} {...otherProps} />
    );
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ThemedPressable(props: PressProps) {
  const { style, animated, backgroundColor, ...otherProps } = props;
  const defaultBackgroundColor = useThemeColor("background");
  // Keep a single fallback state object to satisfy both RN core typings
  // ({ pressed }) and Expo web-augmented typings ({ pressed, hovered }).
  const defaultPressableState = { pressed: false, hovered: false };

  if (animated) {
    return (
      <AnimatedPressable
        style={[
          { backgroundColor },
          typeof style === "function"
            ? style(defaultPressableState)
            : style,
        ]}
        {...otherProps}
      />
    );
  }

  return (
    <Pressable
      style={[
        { backgroundColor: backgroundColor || defaultBackgroundColor },
        typeof style === "function"
          ? style(defaultPressableState)
          : style,
      ]}
      {...otherProps}
    />
  );
}

export function ThemedTextInput(props: InputProps) {
  const { style, animated, ref, ...otherProps } = props;
  const backgroundColor = useThemeColor("background");
  const color = useThemeColor("text");

  if (animated) {
    return (
      <AnimatedTextInput
        ref={ref}
        style={[{ backgroundColor, color }, style]}
        {...otherProps}
      />
    );
  }

  return (
    <TextInput
      ref={ref}
      style={[{ backgroundColor, color }, style]}
      {...otherProps}
    />
  );
}
