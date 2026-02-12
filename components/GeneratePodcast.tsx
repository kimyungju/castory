import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

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

  const generatePodcast = async () => {
    // TODO: Implement AI audio generation
    setIsGenerating(true);
    try {
      console.log("Generate podcast with voice:", voiceType);
      console.log("Prompt:", voicePrompt);
      // Placeholder for future implementation
    } catch (error) {
      console.error("Error generating podcast:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to Generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate audio"
          rows={5}
          value={voicePrompt}
          onChange={(e) => setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="button"
          className="text-16 bg-orange-1 py-4 font-bold text-white-1"
          onClick={generatePodcast}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader size={20} className="animate-spin mr-2" />
              Generating
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </div>
  );
};

export default GeneratePodcast;
