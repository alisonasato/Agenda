"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { DatePicker } from "../shared/DatePicker";
import { CheckboxMark, SaveIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { ACCESS_INTERVALS, ACCESS_KEY_TYPES, type AccessList } from "@/lib/seiri/types";

const pad = (n: number) => String(n).padStart(2, "0");
const show = (date: Date | null) => (date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : "");
const parse = (text: string) => {
  const [day, month, year] = text.split("/").map(Number);
  return day && month && year ? new Date(year, month - 1, day) : null;
};

function Checkbox({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="hcheckbox">
      <input type="checkbox" name={name} id={`id_${name}`} className="hcheckbox-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckboxMark />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      <span className="hcheckbox-label">{label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-5 border-t border-gray-100 space-y-4 first:pt-0 first:border-t-0">
      <h4 className="text-sm font-semibold text-gray-900 inter-semibold">{title}</h4>
      {children}
    </div>
  );
}

/** Clone of "Nova Lista" (`/users/clientes_autorizados/listas_acesso/nova`). */
export function AccessListModal({ list, onClose }: { list?: AccessList; onClose: () => void }) {
  const data = useData();
  const today = new Date();
  const [title, setTitle] = useState(list?.title ?? "");
  const [keyType, setKeyType] = useState(list?.keyType ?? "");
  const [max, setMax] = useState(list ? String(list.maxAppointments) : "");
  const [interval, setInterval] = useState(list?.interval ?? "");
  const [days, setDays] = useState(list?.days ? String(list.days) : "");
  const [expires, setExpires] = useState<Date | null>(parse(list?.expiresAt ?? ""));
  const [maxDate, setMaxDate] = useState<Date | null>(parse(list?.maxDate ?? ""));
  const [allAgendas, setAllAgendas] = useState(list ? !list.agendaIds.length : true);
  const [allServices, setAllServices] = useState(list ? !list.serviceIds.length : true);
  const [agendaIds, setAgendaIds] = useState<string[]>(list?.agendaIds ?? []);
  const [serviceIds, setServiceIds] = useState<string[]>(list?.serviceIds ?? []);
  const [loginRequired, setLoginRequired] = useState(list?.loginRequired ?? true);
  const [helpText, setHelpText] = useState(list?.helpText ?? "");
  const [useExternal, setUseExternal] = useState(list?.useExternalList ?? false);
  const [apiUrl, setApiUrl] = useState(list?.externalApiUrl ?? "");
  const [apiSecret, setApiSecret] = useState("");
  const [clientIds, setClientIds] = useState<string[]>(list?.clientIds ?? []);
  const [denied, setDenied] = useState(list?.unauthorizedMessage ?? "");

  const ready = Boolean(title.trim() && keyType);

  const save = () => {
    if (!ready) return;
    update((d) => {
      const row: AccessList = {
        id: list?.id ?? nextId("al", d.accessLists),
        title: title.trim(),
        keyType,
        maxAppointments: Number(max) || 0,
        interval,
        days: Number(days) || 0,
        expiresAt: show(expires),
        maxDate: show(maxDate),
        agendaIds: allAgendas ? [] : agendaIds,
        serviceIds: allServices ? [] : serviceIds,
        loginRequired,
        helpText: helpText.trim(),
        useExternalList: useExternal,
        externalApiUrl: useExternal ? apiUrl.trim() : "",
        unauthorizedMessage: denied.trim(),
        clientIds,
        active: list?.active ?? true,
      };
      return { ...d, accessLists: list ? d.accessLists.map((l) => (l.id === list.id ? row : l)) : [...d.accessLists, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="acl-control-modal"
      title={list ? "Editar Lista" : "Nova Lista"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" disabled={!ready} onClick={save}>
            <SaveIcon className="w-4 h-4" />
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Dados Gerais">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_title">
              Nome <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input id="id_title" name="title" className="hinput" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <Combobox
            id="access_key_type"
            label="Tipo de Chave de Acesso"
            required
            options={ACCESS_KEY_TYPES}
            value={keyType}
            onChange={setKeyType}
            placeholder="Selecione"
            clearable={false}
          />
        </Section>

        <Section title="Limites de Agendamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_max_app">
                Número máximo de agendamentos
              </label>
              <div className="hinput-wrap">
                <input id="id_max_app" name="max_app" className="hinput" type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} />
              </div>
            </div>
            <Combobox
              id="interval"
              label="Período"
              options={ACCESS_INTERVALS}
              value={interval}
              onChange={setInterval}
              placeholder="Selecione"
              clearable={false}
            />
            {interval === "NDAYS" && (
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_days_interval">
                  Período em dias
                </label>
                <div className="hinput-wrap">
                  <input
                    id="id_days_interval"
                    name="days_interval"
                    className="hinput"
                    type="number"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_expires_at">
                Expira em
              </label>
              <div className="mt-1.5">
                <DatePicker id="id_expires_at" name="expires_at" ariaLabel="Expira em" value={expires} onChange={setExpires} today={today} />
              </div>
            </div>
            <div className="hinput-field hinput-field--block">
              <label className="hinput-label" htmlFor="id_max_date">
                Agendar até
              </label>
              <div className="mt-1.5">
                <DatePicker id="id_max_date" name="max_date" ariaLabel="Agendar até" value={maxDate} onChange={setMaxDate} today={today} />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Permissões">
          <div className="hcheckbox-stack">
            <Checkbox name="is_all_calendar" label="Acessar todas as agenda externas" checked={allAgendas} onChange={setAllAgendas} />
            <Checkbox name="is_all_service" label="Acessar todos os serviços" checked={allServices} onChange={setAllServices} />
            <Checkbox name="login_required" label="Login obrigatório" checked={loginRequired} onChange={setLoginRequired} />
          </div>
          {!allAgendas && (
            <ChipMultiSelect
              id="appointment_type_access"
              label="Agendas com acesso"
              placeholder="Buscar..."
              options={data.agendas.map((a) => ({ id: a.id, label: a.name }))}
              values={agendaIds}
              onChange={setAgendaIds}
            />
          )}
          {!allServices && (
            <ChipMultiSelect
              id="appointment_subtype_access"
              label="Serviços com acesso"
              placeholder="Buscar..."
              options={data.services.map((s) => ({ id: s.id, label: s.name }))}
              values={serviceIds}
              onChange={setServiceIds}
            />
          )}
          <div>
            <label className="hinput-label" htmlFor="id_access_type_help_text">
              Texto de ajuda para o tipo de chave de acesso
            </label>
            <textarea
              id="id_access_type_help_text"
              name="access_type_help_text"
              rows={2}
              className="htextarea mt-1.5"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
            />
          </div>
        </Section>

        <Section title="Lista Externa de Acesso">
          <Checkbox name="use_external_list" label="Usar lista externa de Acesso" checked={useExternal} onChange={setUseExternal} />
          {useExternal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_external_api_url">
                  URL da API Externa
                </label>
                <div className="hinput-wrap">
                  <input
                    id="id_external_api_url"
                    name="external_api_url"
                    className="hinput"
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_external_api_secret">
                  Chave Secreta da API Externa
                </label>
                <div className="hinput-wrap">
                  <input
                    id="id_external_api_secret"
                    name="external_api_secret"
                    className="hinput"
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </Section>

        <Section title="Convites de cadastro">
          <ChipMultiSelect
            id="registration_invites"
            placeholder="Buscar..."
            options={data.clients.map((c) => ({ id: c.id, label: c.name }))}
            values={clientIds}
            onChange={setClientIds}
          />
        </Section>

        <Section title="Mensagem de Acesso Negado">
          <textarea
            id="id_custom_unauthorized_message"
            name="custom_unauthorized_message"
            rows={2}
            className="htextarea"
            value={denied}
            onChange={(e) => setDenied(e.target.value)}
          />
        </Section>
      </div>
    </Modal>
  );
}
