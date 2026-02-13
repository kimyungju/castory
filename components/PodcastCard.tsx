"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { normalizeImageSrc } from "@/lib/utils";
import { Headphones } from "lucide-react";

const PodcastCard = ({
  imgURL,
  title,
  description,
  podcastId,
}: {
  imgURL: string;
  title: string;
  description: string;
  podcastId: Id<"podcasts">;
}) => {
  const router = useRouter();
  const updateViews = useMutation(api.podcast.updatePodcastViews);
  const [src, setSrc] = React.useState(() => normalizeImageSrc(imgURL));
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = async () => {
    await updateViews({ podcastId });
    router.push(`/podcast/${podcastId}`, { scroll: true });
  };

  return (
    <button
      type="button"
      className="cursor-pointer group animate-rotate-in text-left w-full"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure className="relative">
        {/* Main Card Container */}
        <div className="card-brutal overflow-hidden transition-all duration-300 group-hover:border-orange-1">
          {/* Image Container with Overlay */}
          <div className="relative aspect-square overflow-hidden noise-texture">
            <Image
              src={src}
              width={400}
              height={400}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setSrc("/placeholder.svg")}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Hover Play Icon */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <div className="bg-orange-1 border-4 border-charcoal p-4 rounded-none shadow-brutal-lg">
                <Headphones className="w-8 h-8 text-charcoal" />
              </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-1 transform translate-x-8 -translate-y-8 rotate-45 opacity-60" />
          </div>

          {/* Content Section */}
          <div className="p-4 bg-black-1 border-t-4 border-orange-1 relative">
            {/* Accent Stripe */}
            <div className="absolute left-0 top-0 w-1 h-full bg-orange-1" />

            <div className="pl-3">
              {/* Title */}
              <h1 className="text-18 font-bold text-white-1 mb-2 line-clamp-2 group-hover:text-orange-1 transition-colors uppercase tracking-wide">
                {title}
              </h1>

              {/* Description */}
              <h2 className="text-14 text-white-4 line-clamp-2 font-serif italic">
                {description}
              </h2>

              {/* Decorative Element */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-mid-gray/30">
                <div className="h-1 w-12 bg-orange-1" />
                <span className="text-10 text-white-4 uppercase tracking-widest font-bold">
                  Episode
                </span>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </button>
  );
};

export default PodcastCard;
