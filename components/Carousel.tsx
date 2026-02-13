"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { normalizeImageSrc } from "@/lib/utils";
import DotButton from "./DotButton";
import LoaderSpinner from "./LoaderSpinner";

type CarouselProps = {
  fansLikeDetail: {
    _id: string;
    clerkId: string;
    name: string;
    imageUrl: string;
    totalPodcasts: number;
    podcast: { podcastTitle: string; podcastId: string }[];
  }[];
};

const Carousel = ({ fansLikeDetail }: CarouselProps) => {
  const router = useRouter();
  const slides =
    fansLikeDetail?.filter((item) => item.totalPodcasts > 0) ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (slides.length === 0) return <LoaderSpinner />;

  return (
    <div className="flex flex-col gap-4 overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.slice(0, 5).map((item) => (
          <figure
            key={item._id}
            className="carousel_box"
            onClick={() => {
              if (item.podcast[0]?.podcastId) router.push(`/podcast/${item.podcast[0].podcastId}`);
            }}
          >
            <Image
              src={normalizeImageSrc(item.imageUrl)}
              alt="card"
              fill
              className="absolute object-cover rounded-xl border-none"
            />
            <div className="glassmorphism-black relative z-10 flex flex-col rounded-b-xl p-4">
              <h2 className="text-14 font-semibold text-white-1 truncate">
                {item.podcast[0]?.podcastTitle}
              </h2>
              <p className="text-12 font-normal text-white-2">{item.name}</p>
            </div>
          </figure>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {slides.slice(0, 5).map((_, index) => (
          <DotButton
            key={index}
            selected={index === selectedIndex}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
