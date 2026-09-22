import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/sites/eagenda-com-br-a1f95f96/onboarding-45eccead/OnboardingWizard";
import "./onboarding.css";

// Clone of https://eagenda.com.br/onboarding/ (Ajuda › Passo a Passo), with mock account data.
export const metadata: Metadata = {
  title: "Vamos começar — Seiri",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
