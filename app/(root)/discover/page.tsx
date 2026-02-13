"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDebounce } from "@/lib/useDebounce";
import PodcastCard from "@/components/PodcastCard";
import LoaderSpinner from "@/components/LoaderSpinner";
import EmptyState from "@/components/EmptyState";
import { Search } from "lucide-react";

const Discover = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const podcastsData = useQuery(api.podcast.getPodcastBySearch, {
    search: debouncedSearch,
  });

  return (
    <div className="mt-9 flex flex-col gap-9">
      <section className="flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Discover</h1>
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white-4"
          />
          <input
            type="text"
            placeholder="Search for podcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-class w-full"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </section>

      {podcastsData === undefined ? (
        <LoaderSpinner />
      ) : podcastsData.length > 0 ? (
        <div className="podcast_grid">
          {podcastsData.map((podcast) => (
            <PodcastCard
              key={podcast._id}
              imgURL={podcast.imageUrl ?? ""}
              title={podcast.podcastTitle}
              description={podcast.podcastDescription}
              podcastId={podcast._id}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No results found" />
      )}
    </div>
  );
};

export default Discover;
