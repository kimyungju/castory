"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn, normalizeImageSrc } from "@/lib/utils";
import { sidebarLinks } from "@/constants";
import { SignedIn, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  return (
    <Sheet>
      <SheetTrigger>
        <Image
          src="/icons/hamburger.svg"
          width={30}
          height={30}
          alt="menu"
          className="cursor-pointer"
        />
      </SheetTrigger>
      <SheetContent side="left" className="border-none bg-black-1" aria-describedby={undefined}>
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <Link href="/" className="flex cursor-pointer items-center gap-1 pb-10">
          <Image src="/icons/logo.svg" alt="logo" width={23} height={27} />
          <h1 className="text-24 font-extrabold text-white-1">Castory</h1>
        </Link>

        <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <nav className="flex flex-col gap-6">
              {sidebarLinks.map(({ route, label, imgURL }) => {
                const isActive =
                  pathname === route || pathname.startsWith(`${route}/`);

                return (
                  <SheetClose asChild key={label}>
                    <Link
                      href={route}
                      className={cn(
                        "flex gap-3 items-center py-4 px-4",
                        {
                          "bg-nav-focus border-r-4 border-orange-1": isActive,
                        }
                      )}
                    >
                      <Image
                        src={normalizeImageSrc(imgURL)}
                        alt={label}
                        width={24}
                        height={24}
                      />
                      <p>{label}</p>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </SheetClose>

          <SignedIn>
            <div className="flex-center w-full pb-14">
              <Button
                className="text-16 w-full bg-orange-1 font-extrabold"
                onClick={() => signOut(() => router.push("/sign-in"))}
              >
                Log Out
              </Button>
            </div>
          </SignedIn>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
