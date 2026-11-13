"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasSeenOnboarding } from "@/lib/onboarding";

const SPLASH_MS = 1600;

export function SplashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const next = hasSeenOnboarding() ? "/app" : "/onboarding";
    router.prefetch(next);
    const timer = setTimeout(() => router.replace(next, { transitionTypes: ["dissolve"] }), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
