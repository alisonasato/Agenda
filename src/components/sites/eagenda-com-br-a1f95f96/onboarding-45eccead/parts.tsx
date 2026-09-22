"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { withBase } from "@/lib/basePath";
import { ArrowRightIcon, ChevronLeftIcon } from "../shared/icons";

/** `--d` is the entrance delay each `.onb-in` / `.onb-rise` element carries in the original. */
export const delay = (ms: number, extra?: CSSProperties) => ({ "--d": `${ms}ms`, ...extra }) as CSSProperties;

const LOTTIES = {
  hello: "hello.json",
  services: "services.json",
  agenda: "agenda.json",
  alert: "alert.json",
  google: "google.json",
  congrats: "congrats.json",
} as const;

/** One of the wizard's Lottie animations, played by lottie-web like the original. */
export function Lottie({
  name,
  size,
  speed,
  className,
  style,
}: {
  name: keyof typeof LOTTIES;
  size: number;
  speed?: number;
  className: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let animation: { destroy: () => void; setSpeed: (n: number) => void } | undefined;
    let cancelled = false;
    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !container) return;
      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: withBase(`/sites/eagenda-com-br-a1f95f96/onboarding-45eccead/${LOTTIES[name]}`),
      });
      if (speed) animation.setSpeed(speed);
    });
    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [name, speed]);
  return <div ref={ref} className={`onb-orb-in ${className}`} style={{ width: size, height: size, ...style }} aria-hidden="true" />;
}

/** The question screen every step opens with: animation, "ETAPA n DE 7", title, lead and the choices. */
export function AskScreen({
  lottie,
  size,
  speed,
  lottieClass = "mx-auto mb-8",
  lottieStyle,
  step,
  title,
  lead,
  titleClass = "leading-[1.06]",
  leadClass = "mt-5",
  delays = [700, 840, 960, 1080],
  children,
}: {
  lottie: keyof typeof LOTTIES;
  size: number;
  speed?: number;
  lottieClass?: string;
  lottieStyle?: CSSProperties;
  step: number;
  title: string;
  lead: string;
  titleClass?: string;
  leadClass?: string;
  delays?: [number, number, number, number];
  children: ReactNode;
}) {
  return (
    <section className="min-h-full flex flex-col items-center justify-center text-center px-6 py-8">
      <Lottie name={lottie} size={size} speed={speed} className={lottieClass} style={{ ...lottieStyle, ...delay(0) }} />
      <p className="onb-in text-[13px] font-bold uppercase tracking-[.16em] text-accent mb-3" style={delay(delays[0])}>
        ETAPA {step} DE 7
      </p>
      <h1 className={`onb-in text-[38px] sm:text-[46px] ${titleClass} text-balance font-[700] text-foreground`} style={delay(delays[1])}>
        {title}
      </h1>
      <p className={`onb-in text-[19px] leading-relaxed text-pretty text-muted max-w-lg mx-auto ${leadClass}`} style={delay(delays[2])}>
        {lead}
      </p>
      {children}
    </section>
  );
}

/** A card in an "escolha um caminho" grid (usage mode, service mode, place of service). */
export function ChoiceCard({ icon, title, desc, delay: d, onClick }: { icon: ReactNode; title: string; desc: string; delay: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="onb-rise group bg-surface border border-border rounded-3xl p-6 sm:p-7 cursor-pointer transition-all duration-200 hover:border-accent hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
      style={delay(d)}
    >
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">{icon}</div>
      <div className="text-[22px] font-[700] text-foreground mb-1.5">{title}</div>
      <p className="text-[16px] leading-relaxed text-muted">{desc}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent mt-4 transition-transform group-hover:gap-2.5">
        Escolher
        <ArrowRightIcon className="w-4 h-4" />
      </span>
    </button>
  );
}

export function BackButton({ onClick, children = "Voltar" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onClick}>
      <ChevronLeftIcon />
      {children}
    </button>
  );
}

export function ForwardButton({ onClick, label, disabled, submit }: { onClick?: () => void; label: string; disabled?: boolean; submit?: boolean }) {
  return (
    <button type={submit ? "submit" : "button"} className="hbtn hbtn--primary hbtn--lg" onClick={onClick} disabled={disabled}>
      {label}
      <ArrowRightIcon />
    </button>
  );
}

/** The "Voltar · Salvar e avançar" row at the foot of every config screen. */
export function StepNav({
  onBack,
  onForward,
  label,
  disabled,
  submit,
}: {
  onBack: () => void;
  onForward?: () => void;
  label: string;
  disabled?: boolean;
  submit?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mt-9">
      <BackButton onClick={onBack} />
      <ForwardButton onClick={onForward} label={label} disabled={disabled} submit={submit} />
    </div>
  );
}
