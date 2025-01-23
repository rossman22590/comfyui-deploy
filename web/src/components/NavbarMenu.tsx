"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

export function NavbarMenu({
  className,
  closeSheet,
}: {
  className?: string;
  closeSheet?: () => void;
}) {
  const _isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    setIsDesktop(_isDesktop);
  }, [_isDesktop]);

  const pathnames = usePathname();
  const pathname = `/${pathnames.split("/")[1]}`;

  const pages = [
    {
      name: "Workflows",
      path: "/workflows",
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
      path: "/examples"
    },
    {
      name: "Help",
      path: "https://support.myapps.ai/api-reference/endpoint/get", // External link
      external: true
    },
    {
      name: "Civit AI",
      path: "https://civitai.com", // External link
      external: true
    },
    {
      name: "Manage Billing",
      path: "https://billing.stripe.com/p/login/6oE6rUfvp9Zlc484gg"

    },
    {
      name: "Book Call",
      path: "https://calendly.com/techinschools/pixio-api-onboarding"
    },
    {
      name: "Status",
      path: "https://ai-tutor-x-pixio.instatus.com", // External link
      external: true
    }
  ];

  return (
    <div className={cn("mr-2", className)}>
      {isDesktop && (
        <Tabs
          defaultValue={pathname}
          className="w-fit flex pointer-events-auto"
        >
          <TabsList className="w-full">
            {pages.map((page) => (
              <TabsTrigger
                key={page.name}
                value={page.path}
              >
                {page.external ? (
                  <a href={page.path} target="_blank" rel="noopener noreferrer">{page.name}</a>
                ) : (
                  <Link href={page.path}>{page.name}</Link>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {!isDesktop && (
        <ScrollArea>
          <div className="w-full flex flex-col h-full">
            {pages.map((page) => (
              page.external ? (
                <a
                  key={page.name}
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (!!closeSheet) closeSheet();
                  }}
                  className="p-2 hover:bg-gray-100/20 hover:underline"
                >
                  {page.name}
                </a>
              ) : (
                <Link
                  key={page.name}
                  href={page.path}
                  onClick={() => {
                    if (!!closeSheet) closeSheet();
                  }}
                  className="p-2 hover:bg-gray-100/20 hover:underline"
                >
                  {page.name}
                </Link>
              )
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
