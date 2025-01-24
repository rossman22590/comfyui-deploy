"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

/** Optional submenu interface */
interface SubItem {
  name: string;
  path: string;
  external?: boolean;
}

/** Page interface with optional submenu */
interface Page {
  name: string;
  path: string;
  external?: boolean;
  submenu?: SubItem[];
}

export function NavbarMenu({
  className,
  closeSheet,
}: {
  className?: string;
  closeSheet?: () => void;
}) {
  const isDesktopMedia = useMediaQuery("(min-width: 1024px)");
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(isDesktopMedia);
  }, [isDesktopMedia]);

  const pathnames = usePathname() || "";
  const pathname = `/${pathnames.split("/")[1]}`;

  const pages: Page[] = [
    {
      name: "Workflows",
      path: "/workflows",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Machines",
      path: "/machines",
    },
    {
      name: "API Keys",
      path: "/api-keys",
    },
    {
      name: "Examples",
      path: "/examples",
    },
    {
      name: "Help",
      path: "https://support.myapps.ai/api-reference/endpoint/get",
      external: true,
      submenu: [
        {
          name: "Status",
          path: "https://ai-tutor-x-pixio.instatus.com",
          external: true,
        },
        {
          name: "Manage Billing",
          path: "https://billing.stripe.com/p/login/6oE6rUfvp9Zlc484gg",
          external: true,
        },
        {
          name: "Documentation",
          path: "https://support.myapps.ai/api-reference/endpoint/get",
          external: true,
        },
      ],
    },
    {
      name: "Models",
      path: "#",
      external: true,
      submenu: [
        {
          name: "Base Models",
          path: "https://ai-tutor-x-pixio.instatus.com",
          external: true,
        },
        {
          name: "Civit AI",
          path: "https://civitai.com",
          external: true,
        },
        {
          name: "Common Workflows",
          path: "https://support.myapps.ai/api-reference/endpoint/get",
          external: true,
        },
      ],
    },
    {
      name: "Book Call",
      path: "https://calendly.com/techinschools/pixio-api-onboarding",
    },
    {
      name: "API Demo",
      path: "https://api-demo.myapps.ai",
      external: true,
    },
  ];

  /**
   * Renders a single link or external anchor.
   * If 'isSub' is true, we reduce vertical padding and size a bit.
   */
  function renderLink(
    name: string,
    path: string,
    external?: boolean,
    isSub?: boolean
  ) {
    const classes = cn(
      "block w-full hover:bg-gray-100/20 hover:underline pointer-events-auto px-4",
      isSub ? "py-1 ml-4 text-xs" : "py-2"
    );

    if (external) {
      return (
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          onClick={() => closeSheet?.()}
        >
          {name}
        </a>
      );
    }
    return (
      <Link href={path} className={classes} onClick={() => closeSheet?.()}>
        {name}
      </Link>
    );
  }

  /* -----------------------------------------------------------------
     DESKTOP MENU with hover-based submenus
  ------------------------------------------------------------------ */
  function DesktopTabs() {
    return (
      <Tabs defaultValue={pathname} className="w-fit flex pointer-events-auto">
        <TabsList className="w-full">
          {pages.map((page) => {
            const hasSub = page.submenu && page.submenu.length > 0;
            return (
              <div key={page.name} className="relative group">
                <TabsTrigger
                  value={page.path}
                  className="group-hover:bg-gray-50 flex items-center pointer-events-none"
                >
                  {page.external ? (
                    <a
                      href={page.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto"
                    >
                      {page.name}
                    </a>
                  ) : (
                    <Link href={page.path} className="pointer-events-auto">
                      {page.name}
                    </Link>
                  )}
                  {hasSub && (
                    <span className="ml-1 text-sm pointer-events-none">▼</span>
                  )}
                </TabsTrigger>

                {hasSub && (
                  <div
                    className="
                      absolute left-0 top-full
                      bg-white border border-gray-200
                      rounded-md shadow-lg z-50
                      whitespace-nowrap
                      pointer-events-auto
                      hidden group-hover:block
                      mt-0
                      overflow-hidden
                    "
                  >
                    {page.submenu?.map((sub) => (
                      <div
                        key={sub.name}
                        className="px-4 py-1 text-xs hover:bg-gray-100 cursor-pointer pointer-events-auto"
                      >
                        {renderLink(sub.name, sub.path, sub.external)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </TabsList>
      </Tabs>
    );
  }

  /* -----------------------------------------------------------------
     MOBILE MENU: vertical list, no horizontal scroll
  ------------------------------------------------------------------ */
  function MobileList() {
    return (
      <ScrollArea
        className="w-full max-w-sm h-full overflow-y-auto overflow-x-hidden"
        style={{ maxHeight: "100vh" }}
      >
        <div className="flex flex-col text-sm">
          {pages.map((page) => {
            const hasSub = page.submenu && page.submenu.length > 0;
            return (
              <div
                key={page.name}
                className="border-b border-gray-100 last:border-b-0"
              >
                {renderLink(page.name, page.path, page.external)}
                {hasSub && (
                  <div className="flex flex-col">
                    {page.submenu?.map((sub) =>
                      renderLink(sub.name, sub.path, sub.external, true)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className={cn("mr-2 text-base", className)}>
      {isDesktop ? <DesktopTabs /> : <MobileList />}
    </div>
  );
}
