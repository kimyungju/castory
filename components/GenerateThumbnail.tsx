import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface GenerateThumbnailProps {
  setImageStorageId: (id: Id<"_storage"> | null) => void;
  setImage: (url: string) => void;
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  image: string;
}

const GenerateThumbnail = ({
  setImageStorageId,
  setImage,
  imagePrompt,
  setImagePrompt,
  image,
}: GenerateThumbnailProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnail = async () => {
    // TODO: Implement AI image generation
    setIsGenerating(true);
    try {
      console.log("Generate thumbnail with prompt:", imagePrompt);
      // Placeholder for future implementation
    } catch (error) {
      console.error("Error generating thumbnail:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to Generate Thumbnail
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate thumbnail"
          rows={5}
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="button"
          className="text-16 bg-orange-1 py-4 font-bold text-white-1"
          onClick={generateThumbnail}
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
      {image && (
        <div className="mt-5">
          <Image
            src={image}
            width={200}
            height={200}
            className="rounded-xl"
            alt="thumbnail"
          />
        </div>
      )}
    </div>
  );
};

export default GenerateThumbnail;
