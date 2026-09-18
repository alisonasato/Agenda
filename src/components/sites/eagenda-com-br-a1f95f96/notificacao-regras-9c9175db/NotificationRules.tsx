"use client";

import { Fragment, useRef, useState, type CSSProperties } from "react";
import {
  AddAppointmentIcon,
  BellIcon,
  CaretDownIcon,
  CaretUpIcon,
  ChatIcon,
  CheckReadIcon,
  CloseCircleIcon,
  InboxIcon,
  LetterIcon,
  PlaneIcon,
  RefreshIcon,
  SearchSolidIcon,
} from "../shared/icons";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { CreditCards } from "../shared/CreditCards";
import { Modal, ModalSubmit } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { useDismiss } from "../shared/useDismiss";

// The Comunicação pages, shown inline from 1536px and folded into a menu below that.
const COMMUNICATION_LINKS = [
  { label: "Notificações por Status", href: ROUTES.notificacoesStatus, Icon: RefreshIcon },
  { label: "Modelos de Email", href: ROUTES.modelosEmail, Icon: LetterIcon },
  { label: "Modelos de WhatsApp", href: ROUTES.modelosWhatsapp, Icon: ChatIcon },
  { label: "Acompanhamento", href: ROUTES.acompanhamento, Icon: BellIcon },
];

const COLUMNS = ["Regra", "Agendas", "Canal", "Template", "Envio"];
const SLOTS = 10;

const WHATSAPP_TEMPLATES = [
  { value: "110", label: "Lembrete com Campo Observações" },
  { value: "1", label: "Lembrete de Agendamento - Geral" },
];

// Template texts as the original's /whatsapp_template_text/ endpoint returns them.
const WHATSAPP_TEXTS: Record<string, string> = {
  "1": "Olá, {{nome}}!\n\nEstamos enviando um lembrete do seu agendamento para:\n {{agenda}}\n📅 Data: {{dia}}\n🕒 Horário: {{hora}}\n📍 Local: {{local}}\n\nCaso precise reagendar ou tenha alguma dúvida, é só nos chamar por aqui.",
  "110": "Olá, {{1}}!\n\nEstamos enviando um lembrete do seu agendamento para *{{2}}*:\n\n📅 Data: *{{3}}*\n🕒 Horário: *{{4}}*\n📍 Local: *{{5}}*\n\n📝 Observações:\n{{6}}\n\nCaso precise reagendar ou tenha alguma dúvida, é só nos chamar por aqui",
};

const BEFORE_FILTERS = [
  { value: "CONFIRMADO", label: "Agendamentos Confirmados" },
  { value: "PENDENTE", label: "Agendamentos Aguardando Confirmação" },
];
const AFTER_FILTERS = [
  { value: "ATENDIDO", label: "Atendimento Realizado" },
  { value: "ATEND_OR_CONF", label: "Agendamentos com status de CONFIRMADO ou ATENDIDO" },
  { value: "NO_SHOW", label: "Atendimento Não-Realizado" },
];

/**
 * The original hides these fields with Alpine x-show, i.e. display:none, instead of removing
 * them. That matters: a hidden sibling keeps the space-y margin on the field before it.
 */
const shown = (visible: boolean) => (visible ? undefined : { display: "none" as const });

const SMS_DEFAULT = "{{nome}}, seu agendamento foi confirmado!{{agenda}}, dia {{dia}}, {{hora}}";
const SMS_MAX = 160;

function Checkbox({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="hcheckbox hcheckbox--sm">
      <input type="checkbox" name={name} id={`id_${name}`} className="hcheckbox-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckReadIcon className="hcheckbox-check w-3 h-3" />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      <span className="hcheckbox-label">{label}</span>
    </label>
  );
}

function RadioPills({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="hradiogroup hradiogroup--grid" role="radiogroup" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <label key={o.value} className="hradio-pill">
          <input type="radio" className="hradio-input" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className="hradio-pill-label">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

/** Number field with the original's up/down stepper, clamped to [min, max]. */
function NumberField({ name, label, max, value, onChange }: { name: string; label: string; max: number; value: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(0, Number.isFinite(v) ? v : 0)));
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={`id_${name}`}>
        {label}
      </label>
      <div className="hinput-wrap hinput-wrap--number">
        <input id={`id_${name}`} min={0} max={max} className="hinput" type="number" name={name} value={value} onChange={(e) => set(Number(e.target.value))} />
        <span className="hinput-stepper" aria-hidden="true">
          <button type="button" tabIndex={-1} className="hinput-step hinput-step--up" onClick={() => set(value + 1)}>
            <CaretUpIcon />
          </button>
          <button type="button" tabIndex={-1} className="hinput-step hinput-step--down" onClick={() => set(value - 1)}>
            <CaretDownIcon />
          </button>
        </span>
      </div>
    </div>
  );
}

function RuleFormModal({ onClose }: { onClose: () => void }) {
  const [allAgendas, setAllAgendas] = useState(false);
  const [agendas, setAgendas] = useState<string[]>([]);
  const [recipients, setRecipients] = useState({ client: true, companions: false, owner: false, team: false });
  const [channel, setChannel] = useState("");
  const [smsText, setSmsText] = useState(SMS_DEFAULT);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [customTemplates, setCustomTemplates] = useState<string[]>([]);
  const [survey, setSurvey] = useState("");
  const [immediate, setImmediate] = useState(false);
  const [when, setWhen] = useState("before");
  const [offset, setOffset] = useState({ dias: 0, horas: 0, minutos: 0 });
  const [beforeFilter, setBeforeFilter] = useState("");
  const [afterFilter, setAfterFilter] = useState("");

  const preview = WHATSAPP_TEXTS[whatsappTemplate] ?? "";

  return (
    <Modal
      id="rule-form-modal"
      title="Nova Regra de Notificação"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="rule-form-modal" form="notification-rule-form" icon={<CheckReadIcon />} label="Salvar" />
        </>
      }
    >
      <form id="notification-rule-form" className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_title">
            Nome da Regra <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input id="id_title" className="hinput" type="text" name="title" placeholder="Ex.: Lembrete 24h antes" required />
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 inter-semibold">Agendas</h4>
          <Checkbox name="is_all_agendas" label="Aplicar a todas as agendas" checked={allAgendas} onChange={setAllAgendas} />
          <div style={shown(!allAgendas)}>
            {/* The live account's picker offers no agendas here. */}
            <ChipMultiSelect id="id_agendas" label="Selecione as Agendas" placeholder="Selecione as agendas" options={[]} values={agendas} onChange={setAgendas} />
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 inter-semibold">Destinatários</h4>
          <div className="hcheckbox-stack">
            <Checkbox name="send_to_client" label="Cliente principal do agendamento" checked={recipients.client} onChange={(v) => setRecipients((r) => ({ ...r, client: v }))} />
            <Checkbox name="send_to_companions" label="Acompanhantes" checked={recipients.companions} onChange={(v) => setRecipients((r) => ({ ...r, companions: v }))} />
            <Checkbox name="send_to_owner_user" label="Responsável pelo atendimento" checked={recipients.owner} onChange={(v) => setRecipients((r) => ({ ...r, owner: v }))} />
            <Checkbox
              name="send_to_related_users"
              label="Membros da equipe vinculados ao agendamento"
              checked={recipients.team}
              onChange={(v) => setRecipients((r) => ({ ...r, team: v }))}
            />
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 inter-semibold">
            Forma de Envio <span className="text-red-500">*</span>
          </h4>
          <RadioPills
            name="notification_type"
            options={[
              { value: "sms", label: "SMS" },
              { value: "email", label: "Email" },
              { value: "whatsapp", label: "WhatsApp" },
            ]}
            value={channel}
            onChange={setChannel}
          />

          <div style={shown(channel === "sms")}>
            <label className="hinput-label" htmlFor="id_sms_text">
              Texto do SMS
            </label>
            <textarea
              name="sms_text"
              id="id_sms_text"
              rows={3}
              maxLength={SMS_MAX}
              className="htextarea resize-none"
              placeholder="Digite a mensagem do SMS (máx. 160 caracteres)"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
            />
            <div className="flex items-center justify-between mt-1.5 gap-3">
              <p className="text-xs text-gray-500 inter-regular">Variáveis: {"{{ nome }}, {{ agenda }}, {{ dia }}, {{ hora }}"}</p>
              <span className="text-xs text-gray-500 inter-regular tabular-nums">
                {smsText.length}/{SMS_MAX}
              </span>
            </div>
          </div>

          <div style={shown(channel === "email")}>
            <Combobox id="email_template" label="Modelo do email" options={[]} value={emailTemplate} onChange={setEmailTemplate} placeholder="Selecione um modelo" searchInPopover clearable />
            <p className="mt-1.5 text-xs inter-regular">
              <a
                href={ROUTES.modelosEmail}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus-visible:underline focus:outline-none inter-semibold"
              >
                Gerenciar modelos de email
              </a>
            </p>
          </div>

          <div className="space-y-4" style={shown(channel === "whatsapp")}>
            <div>
              <Combobox
                id="whatsapp_template"
                label="Template de envio via WhatsApp"
                options={WHATSAPP_TEMPLATES}
                value={whatsappTemplate}
                onChange={setWhatsappTemplate}
                placeholder="Selecione um template"
                searchInPopover
                clearable
              />
            </div>
            <div className="rounded-xl border border-gray-200 bg-[color:var(--color-surface-secondary,#f8fafc)] p-3.5" style={shown(Boolean(preview))}>
              <p className="text-xs font-semibold text-gray-700 inter-semibold mb-1">Preview do Template</p>
              <p className="text-sm text-gray-700 inter-regular whitespace-pre-wrap">{preview}</p>
            </div>
            <div>
              <ChipMultiSelect
                id="id_custom_whatsapp_templates"
                label="Mensagens customizadas (opcional)"
                placeholder="Selecione templates customizados"
                options={[]}
                values={customTemplates}
                onChange={setCustomTemplates}
              />
            </div>
          </div>

          <div style={shown(channel === "email" || channel === "sms")}>
            <Combobox id="survey" label="Vincular Formulário de Pesquisa" options={[]} value={survey} onChange={setSurvey} placeholder="Nenhuma pesquisa" searchInPopover clearable />
            <p className="mt-1.5 text-xs text-gray-500 inter-regular">Um link para a pesquisa será incluído na notificação</p>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 inter-semibold">Regra de Envio</h4>
          <div>
            <Checkbox name="immediate_delivery" label="Envio imediato" checked={immediate} onChange={setImmediate} />
            <p className="mt-1 ml-7 text-xs text-gray-500 inter-regular">Envia assim que o agendamento for criado</p>
          </div>
          <div className="space-y-4" style={shown(!immediate)}>
            <div>
              <label className="hinput-label">Quando enviar</label>
              <RadioPills
                name="att_type"
                options={[
                  { value: "before", label: "Antes do horário" },
                  { value: "after", label: "Após o horário" },
                ]}
                value={when}
                onChange={setWhen}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField name="dias" label="Dias" max={180} value={offset.dias} onChange={(v) => setOffset((o) => ({ ...o, dias: v }))} />
              <NumberField name="horas" label="Horas" max={23} value={offset.horas} onChange={(v) => setOffset((o) => ({ ...o, horas: v }))} />
              <NumberField name="minutos" label="Minutos" max={59} value={offset.minutos} onChange={(v) => setOffset((o) => ({ ...o, minutos: v }))} />
            </div>
            <div>
              <div style={shown(when === "before")}>
                <Combobox id="before_filter" label="Filtro de Status" options={BEFORE_FILTERS} value={beforeFilter} onChange={setBeforeFilter} placeholder="Selecione o status" searchInPopover />
              </div>
              <div style={shown(when === "after")}>
                <Combobox id="after_filter" label="Filtro de Status" options={AFTER_FILTERS} value={afterFilter} onChange={setAfterFilter} placeholder="Selecione o status" searchInPopover />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 inter-regular">Só envia se o agendamento estiver com este status</p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** "Comunicação" menu the action bar shows below 1536px instead of the inline links. */
function CommunicationMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="hinline hmenu">
      <button type="button" className="hinline-trigger hinline-trigger--bare" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <ChatIcon className="hinline-icon w-4 h-4" />
        <span className="hinline-label">Comunicação</span>
        <span className="hinline-chevron" aria-hidden="true">
          <CaretDownIcon className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="hselect-popover hmenu-popover" role="menu" style={{ width: "15rem" }}>
          {COMMUNICATION_LINKS.map(({ label, href, Icon }) => (
            <a key={label} href={href} className="hmenu-item" role="menuitem">
              <Icon className="hmenu-item-icon w-4 h-4" />
              <span className="hmenu-item-label">{label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotificationRules() {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  return (
    <>
      <CreditCards balanceLabel="Créditos Gerais" />

      <form id="formFilter" className="mt-6 md:mt-8 hui-reveal" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="rules-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar regra pelo nome"
              aria-label="Buscar regra pelo nome"
              name="search"
              id="rules-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>

          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <AddAppointmentIcon />
              Nova Regra
            </button>
            <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
              <div className="hidden 2xl:flex items-center gap-0.5">
                {COMMUNICATION_LINKS.map(({ label, href, Icon }) => (
                  <Fragment key={label}>
                    <a href={href} className="hbtn hbtn--ghost hbtn--sm">
                      <Icon />
                      <span className="hactionbar-label">{label}</span>
                    </a>
                    <span className="hactionbar-sep" aria-hidden="true" />
                  </Fragment>
                ))}
              </div>
              <div className="flex 2xl:hidden items-center gap-0.5">
                <CommunicationMenu />
                <span className="hactionbar-sep" aria-hidden="true" />
              </div>
              <a href={ROUTES.pacotesEnvio} className="hbtn hbtn--ghost hbtn--sm">
                <PlaneIcon />
                <span className="hactionbar-label">Pacotes de Envio</span>
              </a>
            </ScrollRail>
          </div>
        </div>
      </form>

      <div className="mt-4 hui-reveal">
        <div id="rules-table">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className="htable-col">
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: SLOTS }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* With no rules at all the live page keeps the default variant even while searching. */}
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
              </div>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {creating && <RuleFormModal onClose={() => setCreating(false)} />}
    </>
  );
}
