import { IconSymbol } from "@/components/ui/icon-symbol";
import { ComponentProps } from "react";

export type HomeIconName = ComponentProps<typeof IconSymbol>["name"];

export type HomeFeatureCard = {
  key: string;
  icon: HomeIconName;
  title: string;
  summary: string;
  details: string;
};

export const HOME_FEATURES: HomeFeatureCard[] = [
  {
    key: "capture",
    icon: "photo.on.rectangle.angled",
    title: "Turn photos into notes",
    summary: "Snap or upload images and convert them into structured markdown.",
    details:
      "Use the Add Note tab to attach photos, add context in the prompt, and get an instant draft you can edit.",
  },
  {
    key: "models",
    icon: "brain",
    title: "Choose your AI model",
    summary: "Pick the best model for text, vision, or multimodal tasks.",
    details:
      "Download built-in models, monitor progress, and switch between providers directly in the model selector.",
  },
  {
    key: "search",
    icon: "magnifyingglass",
    title: "Search and revisit",
    summary: "Keep your notes organized and easy to find later.",
    details:
      "Use the Search tab to quickly locate past notes and keep your knowledge base searchable.",
  },
];
