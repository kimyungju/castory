"use client";

import Image from "next/image";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileNav from "@/components/MobileNav";
import PodcastPlayer from "@/components/PodcastPlayer";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useEffect } from "react";

function RedirectToSignIn() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/sign-in");
  }, [router]);
  return null;
}

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col">
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center bg-black-3">
          <Loader className="animate-spin text-orange-1" size={30} />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>

      <Authenticated>
        <main className="relative flex bg-black-3">
          <LeftSidebar />

          <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-14">
            <div className="mx-auto flex w-full max-w-5xl flex-col max-sm:px-4">
              <div className="flex h-16 items-center justify-between md:hidden">
                <Image
                  src="/icons/logo.svg"
                  alt="Podcastr logo"
                  width={30}
                  height={30}
                />
                <MobileNav />
              </div>
              <div className="flex flex-col md:pb-14">{children}</div>
            </div>
          </section>

          <RightSidebar />
        </main>
        <PodcastPlayer />
      </Authenticated>
    </div>
  );
}
