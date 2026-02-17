import { Fragment } from "react";
import { useColorScheme } from "react-native";
import { useMarkdown, useMarkdownHookOptions } from "react-native-marked";

export default function CustomMarkdown({ value }: { value: string }) {
  const colorScheme = useColorScheme();
  const options: useMarkdownHookOptions = {
    colorScheme,
  };
  const elements = useMarkdown(value, options);
  return (
    <>
      {elements.map((element, index) => {
        return <Fragment key={`app_${index}`}>{element}</Fragment>;
      })}
    </>
  );
}
