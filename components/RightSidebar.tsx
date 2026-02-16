"use client";

import { useUser, SignedIn, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { cn, normalizeImageSrc } from "@/lib/utils";
import { useAudio } from "@/app/providers/AudioProvider";
import Header from "./Header";
import Carousel from "./Carousel";
import LoaderSpinner from "./LoaderSpinner";
import { ChevronRight } from "lucide-react";

const RightSidebar = ({ inline = false }: { inline?: boolean }) => {
  const router = useRouter();
  const { user } = useUser();
  const topPodcasters = useQuery(api.user.getTopUserByPodcastCount);
  const { audio } = useAudio();

  if (!topPodcasters) return <LoaderSpinner />;

  const content = (
    <>
      <SignedIn>
        <Link
          href={`/profile/${user?.id}`}
          className="flex items-center gap-3 pb-12"
        >
          <UserButton />
          <div className="flex items-center justify-between w-full">
            <h1 className="text-16 truncate font-semibold text-white-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <ChevronRight size={20} className="text-white-4" />
          </div>
        </Link>
      </SignedIn>

      <section className="flex flex-col gap-8">
        <Header headerTitle="Fans Like You" />
        <Carousel fansLikeDetail={topPodcasters} />
      </section>

      <section className="flex flex-col gap-8 pt-12">
        <Header headerTitle="Top Podcasters" />
        <div className="flex flex-col gap-6">
          {topPodcasters.slice(0, 5).map((podcaster) => (
            <div
              key={podcaster._id}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/profile/${podcaster.clerkId}`)}
            >
              <figure className="flex items-center gap-2">
                <Image
                  src={normalizeImageSrc(podcaster.imageUrl)}
                  alt={podcaster.name}
                  width={44}
                  height={44}
                  className="aspect-square rounded-lg"
                />
                <h2 className="text-14 font-semibold text-white-1">
                  {podcaster.name}
                </h2>
              </figure>
              <p className="text-12 font-normal text-white-4">
                {podcaster.totalPodcasts} podcast
                {podcaster.totalPodcasts !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  if (inline) {
    return <div className="space-y-6 text-white-1">{content}</div>;
  }

  return (
    <section className={cn("right_sidebar text-white-1", { "h-[calc(100vh-140px)]": audio?.audioUrl })}>
      {content}
    </section>
  );
};

export default RightSidebar;
