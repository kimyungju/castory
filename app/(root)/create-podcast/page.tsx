"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader, Mic2, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { voiceCategories } from "@/constants";
import GeneratePodcast from "@/components/GeneratePodcast";
import GenerateThumbnail from "@/components/GenerateThumbnail";

const formSchema = z.object({
  podcastTitle: z.string().min(2, {
    message: "Podcast title must be at least 2 characters.",
  }),
  podcastDescription: z.string().min(2, {
    message: "Podcast description must be at least 2 characters.",
  }),
});

const CreatePodcast = () => {
  const router = useRouter();
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioDuration, setAudioDuration] = useState(0);
  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPodcast = useMutation(api.podcast.createPodcast);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Validate all required fields
      if (!audioUrl || !imageUrl || !voiceType) {
        toast.error("Please generate audio and thumbnail first");
        setIsSubmitting(false);
        return;
      }

      if (!audioStorageId || !imageStorageId) {
        toast.error("Missing storage IDs — please regenerate");
        setIsSubmitting(false);
        return;
      }

      // Create the podcast
      const podcastId = await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId,
        imageStorageId,
      });

      toast.success("Podcast published successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error creating podcast:", error);
      toast.error("Failed to publish podcast. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 flex flex-col noise-texture">
      {/* Header Section - Editorial Style */}
      <div className="relative mb-12 pb-8 border-b-4 border-orange-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-orange-1 rounded-full animate-pulse-glow" />
              <span className="text-12 uppercase tracking-widest text-white-4 font-bold">
                Studio / Create
              </span>
            </div>
            <h1 className="text-display text-white-1 mb-3">
              New Podcast
            </h1>
            <p className="text-16 text-white-4 font-serif italic max-w-2xl">
              Transform your ideas into audio experiences with AI-powered voice generation
            </p>
          </div>

          {/* Decorative Corner Element */}
          <div className="hidden lg:block">
            <div className="relative w-32 h-32">
              <div className="absolute top-0 right-0 w-24 h-24 border-4 border-orange-1 transform rotate-45" />
              <div className="absolute top-4 right-4 w-16 h-16 bg-orange-1/20" />
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-orange-1" />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-12"
        >
          {/* Section 1: Basic Info */}
          <div className="card-brutal p-8 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                01. Basic Information
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              <FormField
                control={form.control}
                name="podcastTitle"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-3">
                    <FormLabel className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
                      <div className="h-1 w-8 bg-orange-1" />
                      Podcast Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="input-class text-18 font-medium focus-visible:ring-offset-orange-1"
                        placeholder="Enter your podcast title..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-orange-1 font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="podcastDescription"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-3">
                    <FormLabel className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
                      <div className="h-1 w-8 bg-orange-1" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="input-class text-16 font-medium focus-visible:ring-offset-orange-1 min-h-[120px]"
                        placeholder="Describe your podcast in a few sentences..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-orange-1 font-medium" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 2: Voice Selection */}
          <div className="card-brutal p-8 animate-slide-in-up stagger-1">
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                02. AI Voice Configuration
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-8 bg-orange-1" />
                Voice Type
              </label>
              <Select onValueChange={(value) => setVoiceType(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-4 border-mid-gray bg-charcoal text-white-1 focus-visible:ring-offset-orange-1 font-medium h-14 ${
                    !voiceType && "text-gray-1"
                  }`}
                >
                  <SelectValue
                    placeholder="Choose an AI voice..."
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-4 border-orange-1 bg-charcoal font-bold text-white-1 focus:ring-orange-1">
                  {voiceCategories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize focus:bg-orange-1 focus:text-charcoal cursor-pointer py-3 text-16 font-bold"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {voiceType && (
                <>
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    className="hidden"
                  />
                  <div className="mt-2 p-3 bg-orange-1/10 border-l-4 border-orange-1">
                    <p className="text-14 text-white-2 font-medium">
                      Selected voice: <span className="text-orange-1 font-bold capitalize">{voiceType}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Audio Generation */}
          <div className="card-brutal p-8 animate-slide-in-up stagger-2">
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                03. Generate Audio
              </h2>
            </div>
            <GeneratePodcast
              voiceType={voiceType!}
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
            />
          </div>

          {/* Section 4: Thumbnail Generation */}
          <div className="card-brutal p-8 animate-slide-in-up stagger-3">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                04. Generate Cover Art
              </h2>
            </div>
            <GenerateThumbnail
              setImageStorageId={setImageStorageId}
              setImage={setImageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
              image={imageUrl}
            />
          </div>

          {/* Submit Button */}
          <div className="w-full animate-slide-in-up stagger-4">
            <Button
              type="submit"
              className="btn-brutal w-full h-16 text-18 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={24} className="animate-spin mr-3" />
                  Publishing...
                </>
              ) : (
                <>
                  <Sparkles size={24} className="mr-3" />
                  Submit & Publish Podcast
                </>
              )}
            </Button>

            {/* Status Indicators */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className={`p-4 border-4 ${audioUrl ? 'border-orange-1 bg-orange-1/10' : 'border-mid-gray bg-charcoal'} text-center`}>
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">Audio</p>
                <p className={`text-14 font-bold ${audioUrl ? 'text-orange-1' : 'text-white-4'}`}>
                  {audioUrl ? '✓ Ready' : 'Pending'}
                </p>
              </div>
              <div className={`p-4 border-4 ${imageUrl ? 'border-orange-1 bg-orange-1/10' : 'border-mid-gray bg-charcoal'} text-center`}>
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">Cover</p>
                <p className={`text-14 font-bold ${imageUrl ? 'text-orange-1' : 'text-white-4'}`}>
                  {imageUrl ? '✓ Ready' : 'Pending'}
                </p>
              </div>
              <div className={`p-4 border-4 ${voiceType ? 'border-orange-1 bg-orange-1/10' : 'border-mid-gray bg-charcoal'} text-center`}>
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">Voice</p>
                <p className={`text-14 font-bold ${voiceType ? 'text-orange-1' : 'text-white-4'}`}>
                  {voiceType ? '✓ Ready' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePodcast;
