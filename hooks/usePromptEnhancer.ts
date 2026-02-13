"use client";

import { useState, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

type EnhancerState = "idle" | "loading" | "reviewing" | "editing";

interface UsePromptEnhancerOptions {
  type: "audio" | "image";
  currentPrompt: string;
  setPrompt: (prompt: string) => void;
}

export function usePromptEnhancer({
  type,
  currentPrompt,
  setPrompt,
}: UsePromptEnhancerOptions) {
  const [state, setState] = useState<EnhancerState>("idle");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const originalPromptRef = useRef("");

  const enhancePromptAction = useAction(api.openai.enhancePromptAction);

  const enhance = useCallback(async () => {
    if (!currentPrompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    setState("loading");
    originalPromptRef.current = currentPrompt;

    try {
      const result = await enhancePromptAction({ prompt: currentPrompt, type });
      setEnhancedPrompt(result);
      setState("reviewing");
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error("Failed to enhance prompt. Please try again.");
      setState("idle");
    }
  }, [currentPrompt, type, enhancePromptAction]);

  const accept = useCallback(() => {
    setPrompt(enhancedPrompt);
    setState("idle");
    toast.success("Enhanced prompt applied!");
  }, [enhancedPrompt, setPrompt]);

  const reject = useCallback(() => {
    setState("idle");
  }, []);

  const startEditing = useCallback(() => {
    setState("editing");
  }, []);

  const confirmEdit = useCallback(
    (edited: string) => {
      setPrompt(edited);
      setState("idle");
      toast.success("Edited prompt applied!");
    },
    [setPrompt]
  );

  const closeModal = useCallback(() => {
    setState("idle");
  }, []);

  return {
    state,
    enhancedPrompt,
    originalPrompt: originalPromptRef.current,
    enhance,
    accept,
    reject,
    startEditing,
    confirmEdit,
    isModalOpen: state === "reviewing" || state === "editing",
    closeModal,
  };
}
