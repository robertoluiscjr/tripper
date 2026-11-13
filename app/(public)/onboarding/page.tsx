import type { Metadata } from "next";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Dissolve } from "@/components/layout/dissolve";
import { OnboardingCarousel } from "./onboarding-carousel";

export const metadata: Metadata = { title: "Boas-vindas" };

export default function OnboardingPage() {
  return (
    <Dissolve>
      <MobileShell className="bg-black">
        <OnboardingCarousel />
      </MobileShell>
    </Dissolve>
  );
}
