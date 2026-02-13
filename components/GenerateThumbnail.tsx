import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [isAiThumbnail, setIsAiThumbnail] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const generateThumbnailAction = useAction(api.openai.generateThumbnailAction);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getUrl = useMutation(api.podcast.getUrl);

  const handleImage = async (blob: Blob, fileName: string) => {
    try {
      const uploadUrl = await generateUploadUrl();

      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.statusText}`);
      }

      const { storageId } = await uploadResult.json();
      const url = await getUrl({ storageId });

      if (!url) {
        throw new Error("Failed to get image URL");
      }

      setImageStorageId(storageId);
      setImage(url);
      toast.success("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setIsImageLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsImageLoading(true);
    setImageStorageId(null);
    setImage("");

    try {
      toast.info("Generating thumbnail...");
      const imageData = await generateThumbnailAction({ prompt: imagePrompt });

      const blob = new Blob([imageData], { type: "image/png" });
      await handleImage(blob, `thumbnail-${Date.now()}.png`);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate thumbnail. Please try again."
      );
      setIsImageLoading(false);
    }
  };

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageLoading(true);
    setImageStorageId(null);
    setImage("");

    await handleImage(file, file.name);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="plain"
          className={cn(
            "text-16 flex-1 py-4 uppercase tracking-wide transition-all",
            isAiThumbnail
              ? "bg-black-6 border-b-4 border-orange-1 text-orange-1"
              : "text-white-4 hover:text-white-1"
          )}
          onClick={() => setIsAiThumbnail(true)}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Use AI to generate thumbnail
        </Button>
        <Button
          type="button"
          variant="plain"
          className={cn(
            "text-16 flex-1 py-4 uppercase tracking-wide transition-all",
            !isAiThumbnail
              ? "bg-black-6 border-b-4 border-orange-1 text-orange-1"
              : "text-white-4 hover:text-white-1"
          )}
          onClick={() => setIsAiThumbnail(false)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload custom image
        </Button>
      </div>

      {isAiThumbnail ? (
        /* AI Mode */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
              <div className="h-1 w-8 bg-orange-1" />
              <ImageIcon className="w-4 h-4 text-orange-1" />
              AI Image Prompt
            </Label>
            <Textarea
              className="input-class font-medium focus-visible:ring-offset-orange-1 min-h-[120px] text-16"
              placeholder="Describe the thumbnail you want to generate..."
              rows={5}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
            <p className="text-12 text-white-4 font-serif italic">
              Tip: Be specific about colors, style, and composition for best results.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              type="button"
              className="btn-brutal flex-1 max-w-xs h-14 text-16"
              onClick={generateImage}
              disabled={isImageLoading}
            >
              {isImageLoading ? (
                <>
                  <Loader size={20} className="animate-spin mr-2" />
                  Generating Thumbnail...
                </>
              ) : (
                <>
                  <ImageIcon size={20} className="mr-2" />
                  Generate Thumbnail
                </>
              )}
            </Button>

            {image && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-1/10 border-l-4 border-orange-1">
                <div className="h-2 w-2 bg-orange-1 rounded-full animate-pulse" />
                <span className="text-14 text-orange-1 font-bold">Image Ready</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Upload Mode */
        <div className="flex flex-col gap-4">
          <div
            className="image_div"
            onClick={() => imageRef.current?.click()}
          >
            <Input
              type="file"
              ref={imageRef}
              className="hidden"
              accept="image/*"
              onChange={uploadImage}
            />
            {isImageLoading ? (
              <Loader size={32} className="animate-spin text-orange-1" />
            ) : (
              <>
                <Image
                  src="/icons/upload-image.svg"
                  width={40}
                  height={40}
                  alt="upload"
                />
                <p className="text-16 text-white-4 font-bold uppercase tracking-wide">
                  Click to upload
                </p>
                <p className="text-12 text-white-4 font-serif italic">
                  SVG, PNG, JPG or GIF (max 5MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {image && (
        <div className="border-4 border-orange-1 bg-charcoal p-6 noise-texture animate-slide-in-up">
          <div className="flex items-center gap-3 mb-4">
            <ImageIcon className="w-5 h-5 text-orange-1" />
            <h3 className="text-16 font-bold text-white-1 uppercase tracking-wide">
              Thumbnail Preview
            </h3>
          </div>
          <Image
            src={image}
            width={400}
            height={400}
            className="w-full max-w-[400px] rounded-sm"
            alt="thumbnail preview"
          />
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 flex-1 bg-orange-1/20" />
            <span className="text-10 uppercase tracking-widest text-white-4 font-bold px-2">
              {isAiThumbnail ? "AI Generated" : "Custom Upload"}
            </span>
            <div className="h-1 flex-1 bg-orange-1/20" />
          </div>
        </div>
      )}

    </div>
  );
};

export default GenerateThumbnail;
