import { ViewTransition } from "react";

/**
 * "Dissolve" de 300ms do protótipo (Splash → Onboarding → Home).
 * Só anima navegações marcadas com transitionTypes: ["dissolve"]; as demais trocas de tela
 * continuam instantâneas, como no Figma. O CSS fica em app/globals.css (.dissolve).
 */
export function Dissolve({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ dissolve: "dissolve", default: "none" }}
      exit={{ dissolve: "dissolve", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
