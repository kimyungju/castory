"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/app/providers/AudioProvider";
import { formatTime } from "@/lib/formatTime";
import { normalizeImageSrc } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
} from "lucide-react";

const PodcastPlayer = () => {
  const { audio } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const forward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 5,
        duration
      );
    }
  };

  const rewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 5,
        0
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("ended", onEnded);
    };
  }, [audio?.audioUrl]);

  useEffect(() => {
    if (audioRef.current && audio?.audioUrl) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [audio?.audioUrl]);

  if (!audio?.audioUrl) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="sticky bottom-0 left-0 flex flex-col w-full z-40 max-sm:max-h-[140px]">
      <Progress value={progress} className="h-1 rounded-none" />
      <div className="glassmorphism flex items-center justify-between px-4 py-3 gap-4 max-sm:flex-col max-sm:gap-2 max-sm:overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/podcast/${audio.podcastId}`}>
            <Image
              src={normalizeImageSrc(audio.imageUrl)}
              width={48}
              height={48}
              alt={audio.title}
              className="rounded object-cover w-12 h-12"
            />
          </Link>
          <div className="flex flex-col min-w-0">
            <h2 className="text-14 font-semibold text-white-1 truncate">
              {audio.title}
            </h2>
            <p className="text-12 text-white-3 truncate">{audio.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={rewind} className="text-white-1 hover:text-orange-1 transition-colors cursor-pointer">
            <Rewind size={20} />
          </button>
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-1 text-charcoal hover:bg-orange-1/80 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button onClick={forward} className="text-white-1 hover:text-orange-1 transition-colors cursor-pointer">
            <FastForward size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-12 text-white-3 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button onClick={toggleMute} className="text-white-1 hover:text-orange-1 transition-colors cursor-pointer">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={audio.audioUrl} />
    </div>
  );
};

export default PodcastPlayer;
