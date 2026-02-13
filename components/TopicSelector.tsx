"use client";

import {
  Cpu,
  Trophy,
  TrendingUp,
  FlaskConical,
  Heart,
  Film,
  Landmark,
  Globe,
} from "lucide-react";
import { newsTopics } from "@/constants";

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Trophy,
  TrendingUp,
  FlaskConical,
  Heart,
  Film,
  Landmark,
  Globe,
};

interface TopicSelectorProps {
  selectedTopic: string | null;
  onSelect: (topic: string) => void;
}

const TopicSelector = ({ selectedTopic, onSelect }: TopicSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {newsTopics.map((topic) => {
        const Icon = iconMap[topic.icon];
        const isSelected = selectedTopic === topic.value;

        return (
          <button
            key={topic.value}
            type="button"
            onClick={() => onSelect(topic.value)}
            className={`group min-w-0 overflow-hidden p-6 text-left transition-all ${
              isSelected
                ? "card-brutal border-orange-1 bg-orange-1/10 translate-x-0 translate-y-0"
                : "card-brutal hover:border-orange-1"
            }`}
          >
            <div
              className={`mb-3 ${isSelected ? "text-orange-1" : "text-white-4 group-hover:text-orange-1"} transition-colors`}
            >
              {Icon && <Icon className="w-8 h-8" />}
            </div>
            <p
              className={`truncate text-16 font-bold uppercase tracking-wide ${
                isSelected ? "text-orange-1" : "text-white-1"
              }`}
            >
              {topic.label}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default TopicSelector;
