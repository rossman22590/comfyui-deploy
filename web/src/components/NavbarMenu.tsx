"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useMediaQuery } from "usehooks-ts";
import { createPortal } from "react-dom";

/** Optional submenu interface */
interface SubItem {
  name: string;
  path: string;
  external?: boolean;
  newTab?: boolean;
}

/** Page interface with optional submenu */
interface Page {
  name: string;
  path: string;
  external?: boolean;
  newTab?: boolean;
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Clean up function to hide all dropdowns when navigating
    return () => {
      setActiveDropdown(null);
    };
  }, []);

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
      newTab: false,
      submenu: [
        {
          name: "Status",
          path: "https://ai-tutor-x-pixio.instatus.com",
          external: true,
          newTab: false,
        },
        {
          name: "Manage Billing",
          path: "https://billing.stripe.com/p/login/6oE6rUfvp9Zlc484gg",
          external: true,
          newTab: false,
        },
        {
          name: "Documentation",
          path: "https://support.myapps.ai/api-reference/endpoint/get",
          external: true,
          newTab: false,
        },
      ],
    },
    {
      name: "Models",
      path: "#",
      external: true,
      newTab: false,
      submenu: [
        {
          name: "Civit AI",
          path: "https://civitai.com",
          external: true,
          newTab: false,
        },
        {
          name: "Supported Models",
          path: "/supported",
          external: true,
          newTab: false,
        },
        {
          name: "JSON Builder",
          path: "/json",
          external: true,
          newTab: false,
        },
      ],
    },
    {
      name: "Book Call",
      path: "https://calendly.com/techinschools/pixio-api-onboarding",
      newTab: false,
    },
    {
      name: "API Demos",
      path: "#",
      external: true,
      newTab: false,
      submenu: [
        {
          name: "NextJs SDK",
          path: "https://api-demo.myapps.ai",
          external: true,
          newTab: true,
        },
        {
          name: "Full Stack App",
          path: "https://pixio-api-fullstack-demo.vercel.app/",
          external: true,
          newTab: true,
        },
      ],
    },
  ];

  function renderLink(
    name: string,
    path: string,
    external?: boolean,
    isSub?: boolean,
    newTab?: boolean
  ) {
    const classes = cn(
      "block w-full hover:bg-gray-100/20 hover:underline pointer-events-auto px-4",
      isSub ? "py-1 ml-4 text-xs" : "py-2"
    );

    if (external) {
      return (
        <a
          href={path}
          className={classes}
          onClick={() => closeSheet?.()}
          target={newTab ? "_blank" : "_self"}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          {name}
        </a>
      );
    }
    return (
      <Link
        href={path}
        className={classes}
        onClick={() => closeSheet?.()}
        target={newTab ? "_blank" : "_self"}
      >
        {name}
      </Link>
    );
  }

  function DesktopTabs() {
    const handleMouseEnter = (event: React.MouseEvent, pageName: string, hasSub: boolean) => {
      if (!hasSub) return;

      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();

      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });

      setActiveDropdown(pageName);
    };

    const handleMouseLeave = () => {
      setActiveDropdown(null);
    };

    return (
      <Tabs defaultValue={pathname} className="w-fit flex pointer-events-auto">
        <TabsList className="w-full relative">
          {pages.map((page) => {
            const hasSub = page.submenu && page.submenu.length > 0;
            return (
              <div
                key={page.name}
                className="relative group"
                onMouseEnter={(e) => handleMouseEnter(e, page.name, !!hasSub)}
                onMouseLeave={handleMouseLeave}
              >
                <TabsTrigger
                  value={page.path}
                  className="group-hover:bg-gray-50 flex items-center pointer-events-none"
                >
                  {page.external ? (
                    <a
                      href={page.path}
                      target={page.newTab ? "_blank" : "_self"}
                      rel={page.newTab ? "noopener noreferrer" : undefined}
                      className="pointer-events-auto"
                    >
                      {page.name}
                    </a>
                  ) : (
                    <Link
                      href={page.path}
                      className="pointer-events-auto"
                      target={page.newTab ? "_blank" : "_self"}
                    >
                      {page.name}
                    </Link>
                  )}
                  {hasSub && (
                    <span className="ml-1 text-sm pointer-events-none">▼</span>
                  )}
                </TabsTrigger>
              </div>
            );
          })}
        </TabsList>
      </Tabs>
    );
  }

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
                {renderLink(page.name, page.path, page.external, false, page.newTab)}
                {hasSub && (
                  <div className="flex flex-col">
                    {page.submenu?.map((sub) =>
                      renderLink(sub.name, sub.path, sub.external, true, sub.newTab)
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
    <div className={cn("mr-2 text-base relative", className)} style={{ zIndex: 1 }}>
      {isDesktop ? <DesktopTabs /> : <MobileList />}

      {/* Portal for dropdowns */}
      {isMounted && activeDropdown && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "absolute",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 2147483647,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.375rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "0.5rem 0",
            minWidth: "12rem",
          }}
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {pages.find((p) => p.name === activeDropdown)?.submenu?.map((sub) => (
            <div
              key={sub.name}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {sub.external ? (
                <a
                  href={sub.path}
                  className="block w-full"
                  target={sub.newTab ? "_blank" : "_self"}
                  rel={sub.newTab ? "noopener noreferrer" : undefined}
                  onClick={() => setActiveDropdown(null)}
                >
                  {sub.name}
                </a>
              ) : (
                <Link
                  href={sub.path}
                  className="block w-full"
                  target={sub.newTab ? "_blank" : "_self"}
                  onClick={() => setActiveDropdown(null)}
                >
                  {sub.name}
                </Link>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
