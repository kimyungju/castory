import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Volume2, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { usePromptEnhancer } from "@/hooks/usePromptEnhancer";
import PromptReviewModal from "@/components/PromptReviewModal";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface GeneratePodcastProps {
  voiceType: string;
  setAudioStorageId: (id: Id<"_storage"> | null) => void;
  setAudio: (url: string) => void;
  voicePrompt: string;
  setVoicePrompt: (prompt: string) => void;
  setAudioDuration: (duration: number) => void;
}

const GeneratePodcast = ({
  voiceType,
  setAudioStorageId,
  setAudio,
  voicePrompt,
  setVoicePrompt,
  setAudioDuration,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const enhancer = usePromptEnhancer({
    type: "audio",
    currentPrompt: voicePrompt,
    setPrompt: setVoicePrompt,
  });

  const generateAudioAction = useAction(api.openai.generateAudioAction);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrl = useMutation(api.podcast.getUrl);

  const generatePodcast = async () => {
    if (!voicePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    if (!voiceType) {
      toast.error("Please select a voice type");
      return;
    }

    setIsGenerating(true);
    setAudioStorageId(null);
    setAudio("");

    try {
      toast.info("Generating audio...");
      const audioData = await generateAudioAction({
        input: voicePrompt,
        voice: voiceType,
      });

      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const fileName = `podcast-${Date.now()}.mp3`;
      const file = new File([blob], fileName, { type: "audio/mpeg" });

      toast.info("Uploading audio...");
      const uploadUrl = await generateUploadUrl();

      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.statusText}`);
      }

      const { storageId } = await uploadResult.json();
      const url = await getUrl({ storageId });

      if (!url) {
        throw new Error("Failed to get audio URL");
      }

      setAudioStorageId(storageId);
      setAudio(url);
      setAudioUrl(url);

      toast.success("Audio generated successfully!");
    } catch (error) {
      console.error("Error generating podcast:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate audio. Please try again."
      );
      setAudioStorageId(null);
      setAudio("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAudioLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audioElement = e.currentTarget;
    setAudioDuration(audioElement.duration);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt Input */}
      <div className="flex flex-col gap-3">
        <Label className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
          <div className="h-1 w-8 bg-orange-1" />
          <Volume2 className="w-4 h-4 text-orange-1" />
          AI Voice Prompt
        </Label>
        <Textarea
          className="input-class font-medium focus-visible:ring-offset-orange-1 min-h-[140px] text-16"
          placeholder="Enter the text you want to convert to speech..."
          rows={5}
          value={voicePrompt}
          onChange={(e) => setVoicePrompt(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <p className="text-12 text-white-4 font-serif italic">
            Tip: Be clear and descriptive for best results. Include any special pronunciation notes.
          </p>
          <Button
            type="button"
            variant="plain"
            className="text-12 text-orange-1 hover:text-orange-1/80 uppercase tracking-wide flex items-center gap-1.5 px-3 py-1.5 border border-orange-1/30 hover:border-orange-1/60 transition-all"
            onClick={enhancer.enhance}
            disabled={enhancer.state === "loading" || isGenerating}
          >
            {enhancer.state === "loading" ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            Enhance
          </Button>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex gap-4 items-center">
        <Button
          type="button"
          className="btn-brutal flex-1 max-w-xs h-14 text-16"
          onClick={generatePodcast}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader size={20} className="animate-spin mr-2" />
              Generating Audio...
            </>
          ) : (
            <>
              <Play size={20} className="mr-2" />
              Generate Audio
            </>
          )}
        </Button>

        {audioUrl && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-1/10 border-l-4 border-orange-1">
            <div className="h-2 w-2 bg-orange-1 rounded-full animate-pulse" />
            <span className="text-14 text-orange-1 font-bold">Audio Ready</span>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="border-4 border-orange-1 bg-charcoal p-6 noise-texture animate-slide-in-up">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-orange-1" />
            <h3 className="text-16 font-bold text-white-1 uppercase tracking-wide">
              Generated Audio Preview
            </h3>
          </div>

          <audio
            src={audioUrl}
            controls
            autoPlay
            onLoadedMetadata={handleAudioLoadedMetadata}
            className="w-full h-12 [&::-webkit-media-controls-panel]:bg-dark-gray [&::-webkit-media-controls-play-button]:text-orange-1"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
            }}
          />

          {/* Decorative Elements */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 flex-1 bg-orange-1/20" />
            <span className="text-10 uppercase tracking-widest text-white-4 font-bold px-2">
              AI Generated
            </span>
            <div className="h-1 flex-1 bg-orange-1/20" />
          </div>
        </div>
      )}

      <PromptReviewModal
        isOpen={enhancer.isModalOpen}
        onClose={enhancer.closeModal}
        originalPrompt={enhancer.originalPrompt}
        enhancedPrompt={enhancer.enhancedPrompt}
        isEditing={enhancer.state === "editing"}
        onAccept={enhancer.accept}
        onReject={enhancer.reject}
        onStartEditing={enhancer.startEditing}
        onConfirmEdit={enhancer.confirmEdit}
        type="audio"
      />
    </div>
  );
};

export default GeneratePodcast;
