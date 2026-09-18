"use client";

import { useState, type FormEvent } from "react";
import { CheckReadIcon, PenIcon, SaveIcon, WalletIcon } from "../shared/icons";
import { AddCreditsModal } from "../shared/AddCreditsModal";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { SaveBar } from "../shared/SaveBar";
import { ROUTES } from "../shared/Sidebar";

const STATUSES = [
  { value: "PENDING", label: "Pendente" },
  { value: "DECLINED", label: "Recusado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "ATTENDED", label: "Atendido" },
  { value: "NO_SHOW", label: "Não Compareceu" },
  { value: "PENDING_PAYMENT", label: "Pagamento Pendente" },
];

const SMS_DEFAULT = "{{nome}}, seu agendamento em {{agenda}} no dia {{dia}} às {{hora}} está {{status}}.";

type Flags = {
  allAgendas: boolean;
  applyToSubaccounts: boolean;
  forceOnSubaccounts: boolean;
  sendToCompanions: boolean;
  sendToOwner: boolean;
  isWhatsapp: boolean;
  isSms: boolean;
  isEmail: boolean;
};

const NO_FLAGS: Flags = {
  allAgendas: false,
  applyToSubaccounts: false,
  forceOnSubaccounts: false,
  sendToCompanions: false,
  sendToOwner: false,
  isWhatsapp: false,
  isSms: false,
  isEmail: false,
};

/** Like the original's x-show: hidden blocks stay mounted with display:none. */
const shown = (visible: boolean) => (visible ? undefined : { display: "none" as const });

function Checkbox({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="hcheckbox">
      <input type="checkbox" name={name} id={`id_${name}`} value="true" className="hcheckbox-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckReadIcon className="hcheckbox-check w-3 h-3" />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      <span className="hcheckbox-label">{label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="hformsection">
      <div className="hformsection-head">
        <h3 className="hformsection-title">{title}</h3>
      </div>
      <div className="hformsection-body">{children}</div>
    </section>
  );
}

export function StatusRuleForm() {
  const [status, setStatus] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [flags, setFlags] = useState<Flags>(NO_FLAGS);
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [smsText, setSmsText] = useState(SMS_DEFAULT);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [addingCredits, setAddingCredits] = useState(false);

  const flag = (key: keyof Flags) => ({ checked: flags[key], onChange: (v: boolean) => setFlags((f) => ({ ...f, [key]: v })) });
  const dirty =
    Boolean(status || whatsappTemplate || emailTemplate) ||
    agendas.length > 0 ||
    smsText !== SMS_DEFAULT ||
    (Object.keys(flags) as (keyof Flags)[]).some((k) => flags[k] !== NO_FLAGS[k]);

  // No backend in the prototype: saving does nothing.
  const onSubmit = (e: FormEvent) => e.preventDefault();

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6 hui-reveal">
        <button type="button" className="hbtn hbtn--secondary" onClick={() => setAddingCredits(true)}>
          <WalletIcon />
          Adicionar Créditos
        </button>
      </div>

      <form id="status-rule-form" onSubmit={onSubmit}>
        <div className="hformpanel">
          <Section title="Configuração Geral">
            <div className="space-y-4">
              <div className="md:max-w-md">
                <Combobox id="status" label="Status do Agendamento" options={STATUSES} value={status} onChange={setStatus} placeholder="Selecione um status" clearable={false} />
              </div>
              <div className="hcheckbox-stack">
                <Checkbox name="is_all_agendas" label="Aplicar a regra em todas as agendas" {...flag("allAgendas")} />
              </div>
              <div style={shown(!flags.allAgendas)}>
                {/* The live account's picker offers no agendas here. */}
                <ChipMultiSelect id="id_agendas" label="Agendas" placeholder="Selecione as agendas" options={[]} values={agendas} onChange={setAgendas} />
              </div>
            </div>
          </Section>

          <Section title="Herança para Subcontas">
            <div className="hcheckbox-stack">
              <Checkbox name="apply_to_subaccounts" label="Aplicar nas subcontas" {...flag("applyToSubaccounts")} />
              <Checkbox name="force_on_subaccounts" label="Forçar em todas as subcontas (sobrescreve regras das subcontas)" {...flag("forceOnSubaccounts")} />
            </div>
            <p className="hinput-desc mt-2">
              Força esta regra em todas as subcontas, sobrescrevendo suas próprias regras. Útil para comunicações padronizadas em toda a rede.
            </p>
          </Section>

          <Section title="Destinatários">
            <div className="hcheckbox-stack">
              <Checkbox name="send_to_companions" label="Enviar para os acompanhantes" {...flag("sendToCompanions")} />
              <Checkbox name="send_to_owner_user" label="Enviar para o usuário responsável pelo atendimento" {...flag("sendToOwner")} />
            </div>
          </Section>

          <Section title="Canais e Conteúdo">
            <div className="space-y-4">
              <div className="hcheckbox-stack">
                <Checkbox name="is_whatsapp_rule" label="Envio por whatsapp" {...flag("isWhatsapp")} />
                <Checkbox name="is_sms_rule" label="Envio por SMS" {...flag("isSms")} />
                <Checkbox name="is_email_rule" label="Envio por email" {...flag("isEmail")} />
              </div>

              <div className="space-y-3" style={shown(flags.isWhatsapp)}>
                <Combobox
                  id="template_whatsapp"
                  label="Template WhatsApp"
                  options={[]}
                  value={whatsappTemplate}
                  onChange={setWhatsappTemplate}
                  placeholder="Selecione um template de WhatsApp"
                />
                {/* Filled with the chosen template's text; the live account has no templates here. */}
                <div style={shown(Boolean(whatsappTemplate))}>
                  <div className="hinput-field hinput-field--block">
                    <label className="hinput-label" htmlFor="id_text_wpp_template">
                      Template de envio via WhatsApp
                    </label>
                    <textarea id="id_text_wpp_template" rows={5} readOnly className="htextarea mt-1.5" value="" />
                  </div>
                </div>
              </div>

              <div style={shown(flags.isSms)}>
                <div className="hinput-field hinput-field--block">
                  <label className="hinput-label" htmlFor="id_sms_text">
                    Texto do SMS
                  </label>
                  <textarea id="id_sms_text" name="sms_text" rows={4} className="htextarea mt-1.5" value={smsText} onChange={(e) => setSmsText(e.target.value)} />
                  <p className="hinput-desc">Texto da mensagem SMS. Use variáveis como {"{{nome}}, {{agenda}}"}, etc.</p>
                </div>
              </div>

              <div style={shown(flags.isEmail)}>
                <Combobox id="email_template" label="Template de Email" options={[]} value={emailTemplate} onChange={setEmailTemplate} placeholder="Selecione um template de email" />
              </div>
            </div>
          </Section>
        </div>

        <SaveBar
          backHref={ROUTES.notificacoesStatus}
          saveLabel="Salvar Regra"
          saveIcon={<SaveIcon />}
          dirty={dirty}
          toastIcon={<PenIcon className="w-4 h-4" />}
          toastTitle="Regra ainda não salva"
          toastSub="Salve para a notificação começar a disparar neste status."
        />
      </form>

      {addingCredits && <AddCreditsModal onClose={() => setAddingCredits(false)} />}
    </>
  );
}
