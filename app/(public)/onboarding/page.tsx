import type { Metadata } from "next";
import { MobileShell } from "@/components/layout/mobile-shell";
import { OnboardingCarousel } from "./onboarding-carousel";

export const metadata: Metadata = { title: "Boas-vindas" };

export default function OnboardingPage() {
  return (
    <MobileShell className="bg-black">
      <OnboardingCarousel />
    </MobileShell>
  );
}
