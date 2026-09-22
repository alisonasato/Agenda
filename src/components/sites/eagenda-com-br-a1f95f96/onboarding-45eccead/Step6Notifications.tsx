"use client";

import { useState, type ReactNode } from "react";
import {
  AlarmIcon,
  BellIcon,
  CakeIcon,
  CheckboxMark,
  ChevronLeftIcon,
  ClipboardIcon,
  IdCardIcon,
  InfoIcon,
  LetterIcon,
  MailSealedIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
  WhatsappIcon,
} from "../shared/icons";
import { AskScreen, BackButton, ForwardButton, delay } from "./parts";
import type { StepProps } from "./types";

const TERMS: [string, string][] = [
  ["cliente", "Clientes"],
  ["paciente", "Pacientes"],
  ["aluno", "Alunos"],
  ["participante", "Participantes"],
  ["associado", "Associados"],
  ["membro", "Membros"],
  ["candidato", "Candidatos"],
  ["cidadao", "Cidadãos"],
  ["solicitante", "Solicitantes"],
  ["beneficiario", "Beneficiários"],
  ["tutor", "Tutores"],
];
const TERM_HEADINGS: Record<string, string> = {
  cliente: "Dados do cliente",
  paciente: "Dados do paciente",
  aluno: "Dados do aluno",
  participante: "Dados do participante",
  associado: "Dados do associado",
  membro: "Dados do membro",
  candidato: "Dados do candidato",
  cidadao: "Dados do cidadão",
  solicitante: "Dados do solicitante",
  beneficiario: "Dados do beneficiário",
  tutor: "Dados do tutor",
};

/** The `.hcheckbox` of the design system, with an optional label. */
function Check({
  name,
  checked,
  onChange,
  label,
  size,
  ariaLabel,
  disabled,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: "sm";
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`hcheckbox${size === "sm" ? " hcheckbox--sm" : ""}`}>
      <input
        type="checkbox"
        name={name}
        className="hcheckbox-input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckboxMark />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      {label && <span className="hcheckbox-label">{label}</span>}
    </label>
  );
}

/** One of the three automatic notices, as a card that lights up when it is on. */
function NoticeCard({
  icon,
  title,
  desc,
  on,
  onChange,
  name,
  ariaLabel,
}: {
  icon: ReactNode;
  title: ReactNode;
  desc: ReactNode;
  on: boolean;
  onChange: (v: boolean) => void;
  name: string;
  ariaLabel: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${on ? "border-accent bg-accent/5" : "border-border bg-surface hover:border-accent/30"}`}
    >
      <span className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</span>
      <span className="flex-1">
        {title}
        {desc}
      </span>
      <span className="mt-0.5">
        <Check name={name} checked={on} onChange={onChange} ariaLabel={ariaLabel} />
      </span>
    </label>
  );
}

/** A booking field that is only asked (no "Obrigatório" switch). */
function FieldRow({
  icon,
  label,
  name,
  checked,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-default transition-colors">
      <span className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </span>
      <Check name={name} checked={checked} onChange={onChange} ariaLabel={`Solicitar ${label.toLowerCase()}`} />
    </label>
  );
}

/** Step 6 — "Avisos": the automatic notices and the data asked of whoever books. */
export function Step6Notifications({ phase, setPhase, onNext, onBack }: StepProps) {
  const [part, setPart] = useState(1);
  const [saidYes, setSaidYes] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [term, setTerm] = useState("cliente");
  const [fields, setFields] = useState({
    request_email: true,
    email_required: true,
    request_telefone: true,
    telefone_required: true,
    request_cpf: false,
    request_address: false,
    request_data_nascimento: false,
    request_genero: false,
  });
  const set = (key: keyof typeof fields) => (v: boolean) => setFields((f) => ({ ...f, [key]: v }));
  const emailLocked = emailConfirmation || emailReminder;

  if (phase === "ask") {
    return (
      <AskScreen
        lottie="alert"
        size={240}
        step={6}
        title="Quer avisar seus clientes automaticamente?"
        lead="Confirmações e lembretes por e-mail ou WhatsApp reduzem faltas — a gente envia por você."
        titleClass="leading-[1.08]"
        leadClass="mt-4"
      >
        <div className="onb-in flex flex-col sm:flex-row items-center gap-3 mt-10" style={delay(1080)}>
          <ForwardButton
            label="Sim, quero avisar"
            onClick={() => {
              setSaidYes(true);
              setPart(1);
              setPhase("config");
            }}
          />
          <button
            type="button"
            className="hbtn hbtn--secondary hbtn--lg"
            onClick={() => {
              setSaidYes(false);
              setEmailConfirmation(false);
              setEmailReminder(false);
              setWhatsapp(false);
              setPart(2);
              setPhase("config");
            }}
          >
            Não, aviso por conta própria
          </button>
        </div>
        <div className="onb-in mt-3.5" style={delay(1160)}>
          <button type="button" className="hbtn hbtn--secondary hbtn--lg" onClick={onBack}>
            <ChevronLeftIcon />
            Voltar
          </button>
        </div>
      </AskScreen>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {part === 1 && (
          <div className="bg-surface rounded-2xl border border-border shadow-[var(--hui-shadow-sm)]">
            <div className="flex items-center gap-3 px-7 pt-6 pb-5 border-b border-border">
              <span className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <BellIcon className="w-5 h-5 text-accent" />
              </span>
              <div>
                <h2 className="text-[19px] font-semibold text-foreground">Avisos automáticos</h2>
                <p className="text-[14px] text-muted">Ative os avisos que fazem sentido para você.</p>
              </div>
            </div>
            <div className="px-7 py-6 space-y-3">
              <NoticeCard
                icon={<MailSealedIcon className="w-5 h-5 text-accent" />}
                title={<span className="block text-sm font-semibold text-foreground">E-mail de confirmação</span>}
                desc={<span className="block text-[14px] text-muted mt-0.5">Envia e-mail ao cliente quando o agendamento é confirmado.</span>}
                on={emailConfirmation}
                onChange={setEmailConfirmation}
                name="email_confirmation"
                ariaLabel="E-mail de confirmação"
              />
              <NoticeCard
                icon={<AlarmIcon className="w-5 h-5 text-accent" />}
                title={<span className="block text-sm font-semibold text-foreground">Lembrete por e-mail (24h antes)</span>}
                desc={<span className="block text-[14px] text-muted mt-0.5">Envia lembrete ao cliente 24 horas antes — e avisa você também.</span>}
                on={emailReminder}
                onChange={setEmailReminder}
                name="email_reminder"
                ariaLabel="Lembrete por e-mail 24h antes"
              />
              <NoticeCard
                icon={<WhatsappIcon className="w-5 h-5 text-accent" />}
                title={
                  <span className="block text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                    Lembrete por WhatsApp
                    <span className="text-[10px] font-semibold text-secondary bg-secondary/10 border border-secondary/25 rounded px-1.5 py-0.5">
                      Precisa de saldo
                    </span>
                  </span>
                }
                desc={
                  <span className="block text-[14px] text-muted mt-0.5">
                    Vamos criar a regra desativada: o envio por WhatsApp é cobrado em créditos. Ative em Comunicação quando tiver saldo.
                  </span>
                }
                on={whatsapp}
                onChange={setWhatsapp}
                name="whatsapp_reminder"
                ariaLabel="Lembrete por WhatsApp"
              />
            </div>
          </div>
        )}

        {part === 2 && (
          <div className="bg-surface rounded-2xl border border-border shadow-[var(--hui-shadow-sm)]">
            <div className="flex items-center gap-3 px-7 pt-6 pb-5 border-b border-border">
              <span className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <ClipboardIcon className="w-5 h-5 text-accent" />
              </span>
              <div>
                <h2 className="text-[19px] font-semibold text-foreground">{TERM_HEADINGS[term]}</h2>
                <p className="text-[14px] text-muted">Escolha o que perguntar a quem agenda.</p>
              </div>
            </div>
            <div className="px-7 py-6 space-y-6">
              <div>
                <label htmlFor="onb-term" className="text-sm font-semibold text-foreground">
                  Como você chama quem agenda com você?
                </label>
                <p className="text-[13px] text-muted mt-0.5 mb-2">Vale em todo o sistema: telas, relatórios e e-mails.</p>
                <select
                  id="onb-term"
                  name="client_term"
                  className="hinput hinput--bordered hselect-native w-full sm:max-w-xs"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                >
                  {TERMS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer py-1">
                    <LetterIcon className="w-4 h-4 text-muted" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">E-mail</span>
                      {emailLocked && <span className="block text-[12px] text-muted">Necessário para o aviso por e-mail.</span>}
                    </span>
                    <span className="ml-auto">
                      <Check
                        name="request_email"
                        checked={fields.request_email}
                        onChange={set("request_email")}
                        disabled={emailLocked}
                        size="sm"
                        ariaLabel="Solicitar e-mail"
                      />
                    </span>
                  </label>
                  {fields.request_email && (
                    <span className="flex-shrink-0">
                      <Check name="email_required" checked={fields.email_required} onChange={set("email_required")} label="Obrigatório" size="sm" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer py-1">
                    <PhoneIcon className="w-4 h-4 text-muted" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">Telefone</span>
                      {whatsapp && <span className="block text-[12px] text-muted">Necessário para o lembrete por WhatsApp.</span>}
                    </span>
                    <span className="ml-auto">
                      <Check
                        name="request_telefone"
                        checked={fields.request_telefone}
                        onChange={set("request_telefone")}
                        disabled={whatsapp}
                        size="sm"
                        ariaLabel="Solicitar telefone"
                      />
                    </span>
                  </label>
                  {fields.request_telefone && (
                    <span className="flex-shrink-0">
                      <Check name="telefone_required" checked={fields.telefone_required} onChange={set("telefone_required")} label="Obrigatório" size="sm" />
                    </span>
                  )}
                </div>

                <FieldRow
                  icon={<IdCardIcon className="w-4 h-4 text-muted" />}
                  label="CPF"
                  name="request_cpf"
                  checked={fields.request_cpf}
                  onChange={set("request_cpf")}
                />
                <FieldRow
                  icon={<MapPinIcon className="w-4 h-4 text-muted" />}
                  label="Endereço"
                  name="request_address"
                  checked={fields.request_address}
                  onChange={set("request_address")}
                />
                <FieldRow
                  icon={<CakeIcon className="w-4 h-4 text-muted" />}
                  label="Data de nascimento"
                  name="request_data_nascimento"
                  checked={fields.request_data_nascimento}
                  onChange={set("request_data_nascimento")}
                />
                <FieldRow
                  icon={<UserCircleIcon className="w-4 h-4 text-muted" />}
                  label="Gênero"
                  name="request_genero"
                  checked={fields.request_genero}
                  onChange={set("request_genero")}
                />
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-accent/5 border border-accent/15 px-4 py-3">
                <InfoIcon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-[14px] leading-snug text-muted">O nome do cliente é sempre solicitado. Campos adicionais podem ser configurados depois.</p>
              </div>
            </div>
          </div>
        )}

        <div className="onb-in flex items-center justify-between gap-3 mt-5" style={delay(120)}>
          <BackButton onClick={() => (part === 2 && saidYes ? setPart(1) : setPhase("ask"))} />
          {part === 1 ? <ForwardButton label="Continuar" onClick={() => setPart(2)} /> : <ForwardButton label="Salvar e avançar" submit />}
        </div>
      </form>
    </section>
  );
}
