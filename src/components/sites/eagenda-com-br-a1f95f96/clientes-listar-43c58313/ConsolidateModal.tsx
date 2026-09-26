"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { ArrowRightIcon, ChevronLeftIcon, CheckCircleIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";
import { fold } from "@/lib/seiri/select";
import type { Client, Data } from "@/lib/seiri/types";

/** The three keys the original offers, with the field names it echoes back on the review step. */
const FIELDS = [
  { value: "email", label: "Email" },
  { value: "old_phone", label: "Telefone" },
  { value: "personal_identification_number", label: "CPF/Identificação" },
];

const keyOf = (client: Client, field: string) =>
  field === "email" ? fold(client.email) : field === "old_phone" ? client.phone.replace(/\D/g, "") : (client.cpf ?? "").replace(/\D/g, "");

/** Clients sharing every chosen field (and none of them empty) belong to the same group. */
function groupsOf(clients: Client[], fields: string[]) {
  if (!fields.length) return [];
  const buckets = new Map<string, Client[]>();
  clients.forEach((client) => {
    const parts = fields.map((f) => keyOf(client, f));
    if (parts.some((p) => !p)) return;
    const key = parts.join("|");
    buckets.set(key, [...(buckets.get(key) ?? []), client]);
  });
  return [...buckets.values()].filter((rows) => rows.length > 1);
}

/** Keeps the first row of each group and fills its blanks from the ones being merged into it. */
function merge(data: Data, fields: string[]): Data {
  const groups = groupsOf(data.clients, fields);
  if (!groups.length) return data;
  const winnerOf = new Map<string, string>();
  const merged = new Map<string, Client>();
  groups.forEach(([keep, ...rest]) => {
    const row = { ...keep };
    rest.forEach((other) => {
      winnerOf.set(other.id, keep.id);
      (Object.keys(other) as (keyof Client)[]).forEach((field) => {
        if (field !== "id" && !row[field] && other[field]) Object.assign(row, { [field]: other[field] });
      });
    });
    merged.set(keep.id, row);
  });
  const reroute = (id: string) => winnerOf.get(id) ?? id;
  return {
    ...data,
    clients: data.clients.filter((c) => !winnerOf.has(c.id)).map((c) => merged.get(c.id) ?? c),
    appointments: data.appointments.map((a) => ({ ...a, clientId: reroute(a.clientId) })),
    waiting: data.waiting.map((w) => ({ ...w, clientId: reroute(w.clientId) })),
  };
}

/** "Consolidar Clientes": pick the fields, review the numbers, then confirm the merge. */
export function ConsolidateModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const [fields, setFields] = useState<string[]>([]);
  const [step, setStep] = useState<"fields" | "review" | "done">("fields");
  const [result, setResult] = useState(0);

  const groups = groupsOf(data.clients, fields);
  const rows = groups.reduce((total, g) => total + g.length - 1, 0);
  const toggle = (value: string) => setFields((f) => (f.includes(value) ? f.filter((v) => v !== value) : [...f, value]));

  const confirm = () => {
    setResult(rows);
    update((d) => merge(d, fields));
    setStep("done");
  };

  const footer =
    step === "fields" ? (
      <>
        <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="hbtn hbtn--primary" disabled={!fields.length} onClick={() => setStep("review")}>
          <ArrowRightIcon className="w-4 h-4" />
          Continuar
        </button>
      </>
    ) : step === "review" ? (
      <>
        <button type="button" className="hbtn hbtn--tertiary" onClick={() => setStep("fields")}>
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </button>
        <button type="button" className="hbtn hbtn--danger" disabled={!rows} onClick={confirm}>
          <CheckCircleIcon className="w-4 h-4" />
          Confirmar Fusão
        </button>
      </>
    ) : (
      <button type="button" className="hbtn hbtn--primary" onClick={onClose}>
        Fechar
      </button>
    );

  return (
    <Modal id="consolidate-modal" title="Consolidar Clientes" onClose={onClose} footer={footer}>
      {step === "fields" && (
        <>
          <p className="text-sm text-gray-600 inter-regular">
            Clientes com os mesmos valores nos campos escolhidos serão agrupados e fundidos num único cadastro.
          </p>
          <form id="consolidation-fields-form" className="mt-5" onSubmit={(e) => e.preventDefault()}>
            <p className="hinput-label">Campos para identificar duplicatas</p>
            <div className="mt-2 hcheckbox-stack hcheckbox-stack--tight">
              {FIELDS.map((f) => (
                <label key={f.value} className="hcheckbox">
                  <input
                    type="checkbox"
                    name="match_fields"
                    value={f.value}
                    checked={fields.includes(f.value)}
                    onChange={() => toggle(f.value)}
                    className="hcheckbox-input"
                  />
                  <span className="hcheckbox-box" aria-hidden="true">
                    <svg className="hcheckbox-check" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline
                        className="hcheckbox-check-line"
                        points="1 9 7 14 15 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="hcheckbox-dash" aria-hidden="true" />
                  </span>
                  <span className="hcheckbox-label">{f.label}</span>
                </label>
              ))}
            </div>
          </form>
        </>
      )}

      {step === "review" && (
        <>
          <p className="text-sm text-gray-600 inter-regular">Revise os números antes de confirmar a fusão dos registros duplicados.</p>
          <dl className="mt-5 divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-gray-500 inter-regular">Campos selecionados</dt>
              <dd className="text-sm text-gray-900 inter-semibold text-right">{fields.join(", ")}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-gray-500 inter-regular">Grupos de duplicatas encontrados</dt>
              <dd className="text-sm text-gray-900 inter-semibold">{groups.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-gray-500 inter-regular">Registros a serem fundidos</dt>
              <dd className="text-sm inter-semibold accent-danger val-accent">{rows}</dd>
            </div>
          </dl>
        </>
      )}

      {step === "done" && (
        <div className="halert halert--success" role="alert">
          <span className="halert-indicator" aria-hidden="true">
            <CheckCircleIcon className="w-5 h-5" />
          </span>
          <div className="halert-content">
            <p className="halert-title">Cadastros fundidos</p>
            <p className="halert-description">
              {result} {result === 1 ? "registro duplicado foi fundido" : "registros duplicados foram fundidos"}. Os agendamentos passaram para o cadastro que
              ficou.
            </p>
          </div>
          <div className="halert-actions" />
        </div>
      )}
    </Modal>
  );
}
