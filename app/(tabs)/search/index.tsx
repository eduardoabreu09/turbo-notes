import { ThemedText, ThemedView } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { llama } from "@react-native-ai/llama";
import { streamText } from "ai";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function SearchIndex() {
  const backgroundColor = useThemeColor("background");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      let model: ReturnType<typeof llama.languageModel> | null = null;

      try {
        // Create model instance (Model ID format: "owner/repo/filename.gguf")
        model = llama.languageModel(
          "Qwen/Qwen2.5-3B-Instruct-GGUF/qwen2.5-3b-instruct-q3_k_m.gguf",
        );

        // Download from HuggingFace (with progress)
        await model.download((progress) => {
          console.log(`Downloading: ${progress.percentage}%`);
        });

        // Initialize model (loads into memory)
        await model.prepare();

        // Generate text
        const { textStream } = streamText({
          model,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content:
                "Faça um poema em português sobre programação. Não ultrapasse 3 estrofes",
            },
          ],
        });
        setIsLoading(false);

        for await (const chunk of textStream) {
          setResult((prev) => prev + chunk);
        }
      } catch (error) {
        console.error("LLM load error", error);
        setResult("Erro ao gerar texto.");
      } finally {
        if (model) {
          try {
          } catch (unloadError) {
            console.error("LLM unload error", unloadError);
          }
        }
      }
    };

    load();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor }}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}></ThemedView>
        {/* {Array.from({ length: 50 }).map((_, index) => (
          <ThemedText key={index}>
            This is some extra filler text to demonstrate scrolling inside the
            Search tab.
          </ThemedText>
        ))} */}
        <ThemedText>{isLoading ? "Carregando..." : result}</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  container: {
    ...theme.container,
    paddingVertical: theme.space8,
    gap: theme.space16,
  },
});
