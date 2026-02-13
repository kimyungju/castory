"use client";

import { useState, useEffect, useRef } from "react";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import {
  Loader,
  Newspaper,
  Search,
  FileText,
  Mic2,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import TopicSelector from "@/components/TopicSelector";
import ArticleReview from "@/components/ArticleReview";
import type { NewsArticle } from "@/components/ArticleReview";
import ScriptEditor from "@/components/ScriptEditor";
import { readDraft, useDraftSave } from "@/lib/useDraftPersistence";

const STEPS = [
  { label: "Topic", icon: Newspaper },
  { label: "Articles", icon: Search },
  { label: "Script", icon: FileText },
  { label: "Audio & Art", icon: Mic2 },
  { label: "Publish", icon: Check },
];

const CreateNewsPodcast = () => {
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Topic
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Step 2: Articles
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticleIndexes, setSelectedArticleIndexes] = useState<
    number[]
  >([]);
  const [isFetchingArticles, setIsFetchingArticles] = useState(false);

  // Step 3: Script
  const [script, setScript] = useState("");
  const [tone, setTone] = useState("casual");
  const [duration, setDuration] = useState("medium");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Step 4: Audio & Thumbnail
  const [podcastTitle, setPodcastTitle] = useState("");
  const [podcastDescription, setPodcastDescription] = useState("");
  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioDuration, setAudioDuration] = useState(0);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );

  // Step 5: Publish
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex actions
  const fetchNews = useAction(api.news.fetchNewsForTopic);
  const generateScript = useAction(api.news.generateNewsScript);
  const createPodcast = useMutation(api.podcast.createPodcast);

  // --- Draft persistence ---
  const DRAFT_KEY = "podcastr:draft:news-podcast";
  const restoredRef = useRef(false);

  // Restore draft on mount
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    interface NewsDraft {
      currentStep?: number;
      selectedTopic?: string | null;
      articles?: NewsArticle[];
      selectedArticleIndexes?: number[];
      script?: string;
      tone?: string;
      duration?: string;
      podcastTitle?: string;
      podcastDescription?: string;
      voiceType?: string | null;
      voicePrompt?: string;
      imagePrompt?: string;
    }

    const draft = readDraft<NewsDraft>(DRAFT_KEY);
    if (!draft) return;

    if (draft.currentStep != null) setCurrentStep(draft.currentStep);
    if (draft.selectedTopic != null) setSelectedTopic(draft.selectedTopic);
    if (draft.articles) setArticles(draft.articles);
    if (draft.selectedArticleIndexes)
      setSelectedArticleIndexes(draft.selectedArticleIndexes);
    if (draft.script) setScript(draft.script);
    if (draft.tone) setTone(draft.tone);
    if (draft.duration) setDuration(draft.duration);
    if (draft.podcastTitle) setPodcastTitle(draft.podcastTitle);
    if (draft.podcastDescription)
      setPodcastDescription(draft.podcastDescription);
    if (draft.voiceType !== undefined) setVoiceType(draft.voiceType);
    if (draft.voicePrompt) setVoicePrompt(draft.voicePrompt);
    if (draft.imagePrompt) setImagePrompt(draft.imagePrompt);

    toast.info("Draft restored");
  }, []);

  // Derive draft state (excludes generated URLs, storageIds, loading flags)
  const draftState = {
    currentStep,
    selectedTopic,
    articles,
    selectedArticleIndexes,
    script,
    tone,
    duration,
    podcastTitle,
    podcastDescription,
    voiceType,
    voicePrompt,
    imagePrompt,
  };

  const { lastSaved, clearDraft } = useDraftSave(DRAFT_KEY, draftState);

  // Warn before closing tab during active operations
  useEffect(() => {
    if (!isFetchingArticles && !isGeneratingScript && !isSubmitting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isFetchingArticles, isGeneratingScript, isSubmitting]);

  // --- Step handlers ---

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setArticles([]);
    setSelectedArticleIndexes([]);
    setIsFetchingArticles(true);

    try {
      toast.info("Searching for trending news...");
      const result = await fetchNews({ topic });
      setArticles(result);
      setSelectedArticleIndexes(result.map((_: NewsArticle, i: number) => i));
      setCurrentStep(1);
      toast.success(`Found ${result.length} articles`);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch news. Please try again."
      );
    } finally {
      setIsFetchingArticles(false);
    }
  };

  const handleToggleArticle = (index: number) => {
    setSelectedArticleIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleGenerateScript = async () => {
    const selectedArticles = selectedArticleIndexes.map((i) => articles[i]);
    if (selectedArticles.length === 0) {
      toast.error("Please select at least one article");
      return;
    }

    setIsGeneratingScript(true);

    try {
      toast.info("Generating podcast script...");
      const result = await generateScript({
        topic: selectedTopic!,
        articles: selectedArticles,
        tone,
        duration,
      });
      setScript(result);

      // Auto-fill title and description
      if (!podcastTitle) {
        const topicLabel =
          selectedTopic!.charAt(0).toUpperCase() + selectedTopic!.slice(1);
        setPodcastTitle(
          `${topicLabel} News Briefing — ${new Date().toLocaleDateString()}`
        );
      }
      if (!podcastDescription) {
        setPodcastDescription(
          `A ${tone} ${selectedTopic} news podcast covering ${selectedArticles.length} trending stories.`
        );
      }

      // Pre-fill voice prompt with script
      setVoicePrompt(result);

      // Auto-fill image prompt
      if (!imagePrompt) {
        setImagePrompt(
          `A bold, modern podcast cover art for a ${selectedTopic} news podcast. Dark background with vibrant orange accents. Abstract geometric shapes suggesting ${selectedTopic} themes. Bold typography style. Professional and eye-catching.`
        );
      }

      setCurrentStep(2);
      toast.success("Script generated!");
    } catch (error) {
      console.error("Error generating script:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate script. Please try again."
      );
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleRegenerate = async () => {
    await handleGenerateScript();
  };

  const handlePublish = async () => {
    if (!audioUrl || !imageUrl || !voiceType) {
      toast.error("Please generate audio and thumbnail first");
      return;
    }
    if (!audioStorageId || !imageStorageId) {
      toast.error("Missing storage IDs — please regenerate");
      return;
    }
    if (!podcastTitle.trim() || !podcastDescription.trim()) {
      toast.error("Please fill in the title and description");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPodcast({
        podcastTitle,
        podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        imagePrompt,
        voicePrompt: script,
        views: 0,
        audioDuration,
        audioStorageId,
        imageStorageId,
      });

      toast.success("News podcast published!");
      clearDraft();
      router.push("/");
    } catch (error) {
      console.error("Error publishing podcast:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to publish. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-6 flex flex-col noise-texture">
      {/* Header */}
      <div className="relative mb-12 pb-8 border-b-4 border-orange-1">
        <div className="flex items-start justify-between">
          <div className="lg:pr-44">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-orange-1 rounded-full animate-pulse-glow" />
              <span className="text-12 uppercase tracking-widest text-white-4 font-bold">
                Studio / News
              </span>
            </div>
            <h1 className="text-display text-white-1 mb-3">News Podcast</h1>
            <p className="text-16 text-white-4 font-serif italic max-w-2xl">
              Pick a topic, curate trending articles, and generate an engaging
              news podcast automatically
            </p>
            {lastSaved && (
              <p className="text-12 text-white-4 mt-2">
                Draft saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="relative w-32 h-32 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 border-4 border-orange-1 transform rotate-45" />
              <div className="absolute top-4 right-4 w-16 h-16 bg-orange-1/20" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-24 h-1 bg-orange-1" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.label} className="flex items-center gap-2">
              {index > 0 && (
                <div
                  className={`hidden sm:block w-8 h-1 ${isCompleted ? "bg-orange-1" : "bg-[var(--color-mid-gray)]"}`}
                />
              )}
              <div
                className={`flex items-center gap-2 px-4 py-2 border-4 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-orange-1 bg-orange-1/10 text-orange-1"
                    : isCompleted
                      ? "border-orange-1 bg-orange-1 text-[var(--color-charcoal)]"
                      : "border-[var(--color-mid-gray)] text-white-4"
                }`}
              >
                <StepIcon className="w-4 h-4" />
                <span className="text-12 font-bold uppercase tracking-wide">
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: Topic Selection */}
      {currentStep === 0 && (
        <div className="card-brutal p-8 animate-slide-in-up">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="w-6 h-6 text-orange-1" />
            <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
              01. Pick a Topic
            </h2>
          </div>
          <p className="text-16 text-white-4 mb-6">
            Choose a news category to find today&apos;s trending stories.
          </p>

          {isFetchingArticles ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader size={40} className="animate-spin text-orange-1" />
              <p className="text-16 text-white-4 font-bold uppercase tracking-wide">
                Searching for trending news...
              </p>
              <p className="text-14 text-white-4 font-serif italic">
                This usually takes 3-8 seconds
              </p>
            </div>
          ) : (
            <TopicSelector
              selectedTopic={selectedTopic}
              onSelect={handleTopicSelect}
            />
          )}
        </div>
      )}

      {/* Step 2: Article Review */}
      {currentStep === 1 && (
        <div className="card-brutal p-8 animate-slide-in-up">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-orange-1" />
            <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
              02. Review Articles
            </h2>
          </div>
          <p className="text-16 text-white-4 mb-6">
            Select the articles to include in your podcast script.
          </p>

          <ArticleReview
            articles={articles}
            selectedIndexes={selectedArticleIndexes}
            onToggle={handleToggleArticle}
            onSelectAll={() =>
              setSelectedArticleIndexes(articles.map((_, i) => i))
            }
            onDeselectAll={() => setSelectedArticleIndexes([])}
          />

          <div className="flex gap-4 mt-8">
            <Button
              type="button"
              variant="plain"
              className="h-14 px-6 border-4 border-[var(--color-mid-gray)] text-white-4 font-bold uppercase tracking-wide hover:border-white-1 hover:text-white-1 transition-colors"
              onClick={() => setCurrentStep(0)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button
              type="button"
              className="btn-brutal flex-1 h-14 text-16"
              onClick={handleGenerateScript}
              disabled={
                selectedArticleIndexes.length === 0 || isGeneratingScript
              }
            >
              {isGeneratingScript ? (
                <>
                  <Loader size={20} className="animate-spin mr-2" />
                  Generating Script...
                </>
              ) : (
                <>
                  <ArrowRight size={20} className="mr-2" />
                  Generate Script
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Script Editor */}
      {currentStep === 2 && (
        <div className="card-brutal p-8 animate-slide-in-up">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-orange-1" />
            <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
              03. Edit Script
            </h2>
          </div>
          <p className="text-16 text-white-4 mb-6">
            Review and edit your podcast script. Change tone or duration and
            regenerate if needed.
          </p>

          <ScriptEditor
            script={script}
            onScriptChange={(newScript) => {
              setScript(newScript);
              setVoicePrompt(newScript);
            }}
            tone={tone}
            onToneChange={setTone}
            duration={duration}
            onDurationChange={setDuration}
            onRegenerate={handleRegenerate}
            isRegenerating={isGeneratingScript}
          />

          <div className="flex gap-4 mt-8">
            <Button
              type="button"
              variant="plain"
              className="h-14 px-6 border-4 border-[var(--color-mid-gray)] text-white-4 font-bold uppercase tracking-wide hover:border-white-1 hover:text-white-1 transition-colors"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button
              type="button"
              className="btn-brutal flex-1 h-14 text-16"
              onClick={() => setCurrentStep(3)}
              disabled={!script.trim()}
            >
              <ArrowRight size={20} className="mr-2" />
              Continue to Audio
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Audio & Thumbnail */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-10 animate-slide-in-up">
          {/* Title & Description */}
          <div className="card-brutal p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                04a. Podcast Details
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
                  <div className="h-1 w-8 bg-orange-1" />
                  Title
                </label>
                <Input
                  className="input-class text-18 font-medium"
                  value={podcastTitle}
                  onChange={(e) => setPodcastTitle(e.target.value)}
                  placeholder="Enter podcast title..."
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
                  <div className="h-1 w-8 bg-orange-1" />
                  Description
                </label>
                <Input
                  className="input-class text-16 font-medium"
                  value={podcastDescription}
                  onChange={(e) => setPodcastDescription(e.target.value)}
                  placeholder="Enter podcast description..."
                />
              </div>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="card-brutal p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                04b. Voice Selection
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-16 font-bold text-white-2 uppercase tracking-wide flex items-center gap-2">
                <div className="h-1 w-8 bg-orange-1" />
                Voice Type
              </label>
              <Select onValueChange={(value) => setVoiceType(value)}>
                <SelectTrigger
                  className={`text-16 w-full border-4 border-[var(--color-mid-gray)] bg-[var(--color-charcoal)] text-white-1 font-medium h-14 ${
                    !voiceType && "text-white-4"
                  }`}
                >
                  <SelectValue placeholder="Choose an AI voice..." />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="text-16 border-4 border-orange-1 bg-[var(--color-charcoal)] font-bold text-white-1 z-[999]"
                >
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
                      Selected voice:{" "}
                      <span className="text-orange-1 font-bold capitalize">
                        {voiceType}
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Audio Generation */}
          <div className="card-brutal p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                04c. Generate Audio
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

          {/* Thumbnail Generation */}
          <div className="card-brutal p-8">
            <div className="flex items-center gap-3 mb-6">
              <ImageIcon className="w-6 h-6 text-orange-1" />
              <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
                04d. Generate Cover Art
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

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="plain"
              className="h-14 px-6 border-4 border-[var(--color-mid-gray)] text-white-4 font-bold uppercase tracking-wide hover:border-white-1 hover:text-white-1 transition-colors"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button
              type="button"
              className="btn-brutal flex-1 h-14 text-16"
              onClick={() => setCurrentStep(4)}
              disabled={!audioUrl || !imageUrl || !voiceType}
            >
              <ArrowRight size={20} className="mr-2" />
              Review & Publish
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Publish */}
      {currentStep === 4 && (
        <div className="card-brutal p-8 animate-slide-in-up">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-orange-1" />
            <h2 className="text-24 font-black text-white-1 uppercase tracking-wide">
              05. Publish
            </h2>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border-4 border-orange-1 bg-orange-1/10 text-center">
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">
                  Topic
                </p>
                <p className="text-14 font-bold text-orange-1 capitalize">
                  {selectedTopic}
                </p>
              </div>
              <div className="p-4 border-4 border-orange-1 bg-orange-1/10 text-center">
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">
                  Articles
                </p>
                <p className="text-14 font-bold text-orange-1">
                  {selectedArticleIndexes.length}
                </p>
              </div>
              <div className="p-4 border-4 border-orange-1 bg-orange-1/10 text-center">
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">
                  Audio
                </p>
                <p className="text-14 font-bold text-orange-1">Ready</p>
              </div>
              <div className="p-4 border-4 border-orange-1 bg-orange-1/10 text-center">
                <p className="text-12 uppercase tracking-wide text-white-4 mb-1">
                  Cover
                </p>
                <p className="text-14 font-bold text-orange-1">Ready</p>
              </div>
            </div>

            <div className="p-4 border-4 border-[var(--color-mid-gray)] bg-[var(--color-charcoal)]">
              <p className="text-12 uppercase tracking-wide text-white-4 mb-1">
                Title
              </p>
              <p className="text-18 font-bold text-white-1">{podcastTitle}</p>
            </div>

            <div className="p-4 border-4 border-[var(--color-mid-gray)] bg-[var(--color-charcoal)]">
              <p className="text-12 uppercase tracking-wide text-white-4 mb-1">
                Description
              </p>
              <p className="text-14 text-white-2">{podcastDescription}</p>
            </div>
          </div>

          {/* Publish buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="plain"
              className="h-14 px-6 border-4 border-[var(--color-mid-gray)] text-white-4 font-bold uppercase tracking-wide hover:border-white-1 hover:text-white-1 transition-colors"
              onClick={() => setCurrentStep(3)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button
              type="button"
              className="btn-brutal flex-1 h-16 text-18 uppercase tracking-wider"
              onClick={handlePublish}
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
                  Publish News Podcast
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CreateNewsPodcast;
