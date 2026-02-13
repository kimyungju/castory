"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, normalizeImageSrc } from "@/lib/utils";
import { sidebarLinks } from "@/constants";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const MobileNav = () => {
  const pathname = usePathname();

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
      <SheetContent side="left" className="border-none bg-black-1">
        <Link href="/" className="flex cursor-pointer items-center gap-1 pb-10">
          <Image src="/icons/logo.svg" alt="logo" width={23} height={27} />
          <h1 className="text-24 font-extrabold text-white-1">Podcaster</h1>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
