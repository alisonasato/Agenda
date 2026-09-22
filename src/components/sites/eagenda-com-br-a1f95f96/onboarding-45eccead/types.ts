/** Each step opens with a question ("ask") and then shows its form ("config"). */
export type Phase = "ask" | "config";

export type StepProps = {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  /** Saves (in the original) and moves to the next step. */
  onNext: () => void;
  /** Returns to the previous step. */
  onBack: () => void;
};
