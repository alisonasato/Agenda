"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { Combobox } from "../shared/Combobox";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { CheckboxMark, SaveIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { LIMIT_INTERVALS, LIMIT_KEYS, type BookingLimit, type LimitInterval, type LimitKey, type LimitType } from "@/lib/seiri/types";

const TYPES = [
  { value: "FALTAS", label: "FALTAS" },
  { value: "AGENDAMENTOS", label: "AGENDAMENTOS" },
];

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="hcheckbox-stack">
      <label className="hcheckbox">
        <input type="checkbox" className="hcheckbox-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="hcheckbox-box" aria-hidden="true">
          <CheckboxMark />
          <span className="hcheckbox-dash" aria-hidden="true" />
        </span>
        <span className="hcheckbox-label">{label}</span>
      </label>
    </div>
  );
}

/** Clone of "Adicionar Limite" (`/agendamentos/limites/add`). */
export function LimitModal({ limit, onClose }: { limit?: BookingLimit; onClose: () => void }) {
  const data = useData();
  const [allAgendas, setAllAgendas] = useState(!limit?.agendaIds.length);
  const [allServices, setAllServices] = useState(!limit?.serviceIds.length);
  const [agendaIds, setAgendaIds] = useState<string[]>(limit?.agendaIds ?? []);
  const [serviceIds, setServiceIds] = useState<string[]>(limit?.serviceIds ?? []);
  const [type, setType] = useState<string>(limit?.type ?? "");
  const [max, setMax] = useState(limit ? String(limit.max) : "");
  const [interval, setInterval] = useState<string>(limit?.interval ?? "");
  const [days, setDays] = useState(limit?.days ? String(limit.days) : "");
  const [key, setKey] = useState<string>(limit?.key ?? "");

  const ready = Boolean(type);

  const save = () => {
    if (!ready) return;
    update((d) => {
      const row: BookingLimit = {
        id: limit?.id ?? nextId("lm", d.limits),
        type: type as LimitType,
        key: key as LimitKey | "",
        agendaIds: allAgendas ? [] : agendaIds,
        serviceIds: allServices ? [] : serviceIds,
        interval: interval as LimitInterval | "",
        days: Number(days) || 0,
        max: Number(max) || 0,
      };
      return { ...d, limits: limit ? d.limits.map((l) => (l.id === limit.id ? row : l)) : [...d.limits, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="limite-form-modal"
      title={limit ? "Editar Limite" : "Adicionar Limite"}
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
        <Checkbox label="Aplicar o limite a todas as agendas em conjunto" checked={allAgendas} onChange={setAllAgendas} />
        {!allAgendas && (
          <ChipMultiSelect
            id="agendas"
            label="Selecione as agendas que fazem parte do limite"
            placeholder="Selecione as agendas"
            options={data.agendas.map((a) => ({ id: a.id, label: a.name }))}
            values={agendaIds}
            onChange={setAgendaIds}
          />
        )}

        <Checkbox label="Aplicar o limite a todos os serviços" checked={allServices} onChange={setAllServices} />
        {!allServices && (
          <ChipMultiSelect
            id="subtypes"
            label="Selecione os serviços que fazem parte do limite"
            placeholder="Selecione os serviços"
            options={data.services.map((s) => ({ id: s.id, label: s.name }))}
            values={serviceIds}
            onChange={setServiceIds}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Combobox id="type_limit" label="Tipo de limite" required options={TYPES} value={type} onChange={setType} placeholder="Selecione" clearable={false} />
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_max_app">
              Quantidade máxima
            </label>
            <div className="hinput-wrap">
              <input id="id_max_app" name="max_app" className="hinput" type="number" min={1} value={max} onChange={(e) => setMax(e.target.value)} />
            </div>
          </div>
          <div className={interval === "NDAYS" ? "" : "md:col-span-2"}>
            <Combobox id="interval" label="Período" options={LIMIT_INTERVALS} value={interval} onChange={setInterval} placeholder="Selecione" clearable={false} />
          </div>
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
        </div>

        <div>
          <Combobox id="key" label="Definição do Limite" options={LIMIT_KEYS} value={key} onChange={setKey} placeholder="Selecione" clearable={false} />
          <p className="hinput-desc">
            Escolha quais campos devem ser considerados no cálculo do limite. Se for um limite customizado, preencha os campos abaixo
          </p>
        </div>
      </div>
    </Modal>
  );
}
