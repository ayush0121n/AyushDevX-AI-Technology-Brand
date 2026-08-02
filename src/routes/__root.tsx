import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-4 p-4 bg-red-950 text-red-200 text-left text-xs overflow-auto rounded max-h-64 whitespace-pre-wrap">
          <strong>{error.message}</strong>
          <br/>
          {error.stack}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "AyushDevX — AI & Technology Brand" },
        {
          name: "description",
          content:
            "AyushDevX is a professional AI and technology brand building intelligent applications, AI-powered tools, and digital products.",
        },
        { name: "author", content: "Ayush Gajanan Narkhede" },
        { name: "keywords", content: "AI, Machine Learning, Full-Stack Developer, React, Node.js, Pune, AyushDevX, RAG, Generative AI" },
        { name: "theme-color", content: "#0f0f0f" },
        { property: "og:title", content: "AyushDevX — AI & Technology Brand" },
        {
          property: "og:description",
          content:
            "Building Intelligent Digital Experiences with AI & Technology.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://ayushdevxai.vercel.app/" },
        { property: "og:site_name", content: "AyushDevX" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "AyushDevX — AI & Technology Brand" },
        {
          name: "twitter:description",
          content:
            "Building Intelligent Digital Experiences with AI & Technology.",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { SecurityWrapper } from "@/components/site/SecurityWrapper";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <SecurityWrapper>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </SecurityWrapper>
  );
}
