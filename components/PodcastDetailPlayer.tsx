"use client";

import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils";
import { useAudio } from "@/app/providers/AudioProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play } from "lucide-react";
import React from "react";

const PodcastDetailPlayer = ({
  audioUrl,
  podcastTitle,
  author,
  imageUrl,
  authorImageUrl,
  isOwner,
  podcastId,
}: {
  audioUrl: string;
  podcastTitle: string;
  author: string;
  imageUrl: string;
  authorImageUrl: string;
  isOwner: boolean;
  podcastId: string;
}) => {
  const { setAudio } = useAudio();
  const router = useRouter();
  const deletePodcast = useMutation(api.podcast.deletePodcast);
  const [imgSrc, setImgSrc] = React.useState(() => normalizeImageSrc(imageUrl));
  const [authorSrc, setAuthorSrc] = React.useState(() =>
    normalizeImageSrc(authorImageUrl)
  );

  const handlePlay = () => {
    setAudio({
      title: podcastTitle,
      audioUrl,
      imageUrl,
      author,
      podcastId,
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this podcast?")) return;

    try {
      await deletePodcast({ podcastId: podcastId as Id<"podcasts"> });
      toast.success("Podcast deleted successfully");
      router.push("/");
    } catch {
      toast.error("Failed to delete podcast");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[720px]">
      <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
        <div className="card-brutal overflow-hidden w-[250px] h-[250px] max-sm:w-[180px] max-sm:h-[180px] flex-shrink-0">
          <Image
            src={imgSrc}
            width={250}
            height={250}
            alt={podcastTitle}
            className="w-full h-full object-cover"
            onError={() => setImgSrc("/placeholder.svg")}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-32 font-extrabold text-white-1 uppercase tracking-wide">
            {podcastTitle}
          </h1>

          <div className="flex items-center gap-2">
            <Image
              src={authorSrc}
              width={30}
              height={30}
              alt={author}
              className="rounded-none border-2 border-orange-1"
              onError={() => setAuthorSrc("/placeholder.svg")}
            />
            <span className="text-14 font-bold text-white-3">{author}</span>
            {isOwner && (
              <span className="text-10 bg-orange-1 text-charcoal px-2 py-0.5 font-black uppercase">
                Owner
              </span>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Delete podcast"
              >
                <Image
                  src="/icons/delete.svg"
                  width={18}
                  height={18}
                  alt="Delete podcast"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {audioUrl && (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 w-fit bg-orange-1 text-charcoal px-6 py-3 font-bold uppercase tracking-wide hover:bg-orange-1/80 transition-colors cursor-pointer"
        >
          <Play size={18} />
          Play Podcast
        </button>
      )}
    </div>
  );
};

export default PodcastDetailPlayer;
