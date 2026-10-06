"use client";

import { useState, type CSSProperties } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { Combobox } from "../shared/Combobox";
import { Modal, ModalSubmit } from "../shared/Modal";
import { CheckboxMark, ChevronRightIcon, DangerCircleIcon, GridPlusIcon, InboxIcon, InfoIcon, KeyIcon, PenIcon, SaveIcon, TrashIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { WEBHOOK_EVENTS, WEBHOOK_TYPES, type Webhook } from "@/lib/seiri/types";

const COLUMNS = ["Tipo de Registro", "URL", "Eventos", "método"];
const SLOTS = 10;
/** Every row the original builds posts; the column exists for the ones it may add later. */
const METHOD = "POST";

const STEPS = [
  { title: "Configure o endpoint", desc: "Informe a URL que receberá as notificações" },
  { title: "Selecione os eventos", desc: "Escolha quais eventos deseja monitorar" },
  { title: "Receba notificações", desc: "Seu sistema será notificado automaticamente" },
];

const typeLabel = (value: string) => WEBHOOK_TYPES.find((t) => t.value === value)?.label ?? value;
const eventLabel = (value: string) => WEBHOOK_EVENTS.find((e) => e.value === value)?.label ?? value;

/** "Webhooks": where the platform should POST when appointments, agendas or members change. */
export function Webhooks() {
  const data = useData();
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Webhook | null>(null);

  const rows = data.webhooks;
  const remove = (id: string) => update((d) => ({ ...d, webhooks: d.webhooks.filter((w) => w.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-wrap items-center justify-start gap-3 hui-reveal">
        <button type="button" className="hbtn hbtn--primary" onClick={() => setCreating(true)}>
          <GridPlusIcon />
          Adicionar Webhook
        </button>
        {/* The original links the API integration page, which is out of this clone's scope. */}
        <button type="button" className="hbtn hbtn--secondary">
          <KeyIcon />
          Chave da API
        </button>
      </div>

      <div className="mt-6 hui-reveal" style={{ animationDelay: ".03s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Webhooks Configurados</h2>
            <p className="hwidget-desc">Receba eventos em tempo real quando agendamentos, agendas ou membros mudarem</p>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div id="webhook-table-container" className="mt-4">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full">
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
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="htable-cell">
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">{typeLabel(row.classType)}</span>
                      </td>
                      <td className="htable-cell">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700 font-mono">{row.url}</code>
                      </td>
                      <td className="htable-cell">
                        <span className="inline-flex flex-wrap items-center gap-1">
                          {row.events.map((e) => (
                            <span key={e} className="hchip hchip--default hchip--soft hchip--sm">
                              {eventLabel(e)}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="htable-cell">
                        <span className="hchip hchip--accent hchip--primary hchip--sm">{METHOD}</span>
                      </td>
                      <td className="htable-cell htable-cell--end">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(row)}>
                            <PenIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(row)}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <InboxIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                  <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      <div className="mt-6 hui-reveal hui-card" style={{ animationDelay: ".06s" }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
            <InfoIcon className="w-5 h-5" />
          </span>
          <h4 className="text-base font-bold text-gray-900 nunito-bold">Como funcionam os webhooks?</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-primary text-sm nunito-bold">{i + 1}</span>
              <div className="min-w-0">
                <h5 className="font-semibold text-gray-900 text-sm inter-semibold">{step.title}</h5>
                <p className="text-xs text-gray-500 inter-regular">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(creating || editing) && <WebhookModal webhook={editing ?? undefined} onClose={() => (editing ? setEditing(null) : setCreating(false))} />}
      {removing && (
        <AlertDialog
          id="webhook-delete-dialog"
          heading="Excluir este webhook?"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="hbtn hbtn--danger"
                onClick={() => {
                  remove(removing.id);
                  setRemoving(null);
                }}
              >
                <TrashIcon />
                Excluir
              </button>
            </>
          }
        >
          <p>
            As notificações para <strong className="font-semibold">{removing.url}</strong> param imediatamente. O histórico de envios é mantido.
          </p>
        </AlertDialog>
      )}
    </div>
  );
}

function WebhookModal({ webhook, onClose }: { webhook?: Webhook; onClose: () => void }) {
  const [classType, setClassType] = useState(webhook?.classType ?? "");
  const [url, setUrl] = useState(webhook?.url ?? "");
  const [events, setEvents] = useState<string[]>(webhook?.events ?? []);
  const [authHeader, setAuthHeader] = useState(webhook?.authHeader ?? "{}");
  const [showAuth, setShowAuth] = useState(false);

  // The original clears the chosen events whenever the record type changes.
  const pickType = (next: string) => {
    setClassType(next);
    setEvents([]);
  };

  const available = WEBHOOK_EVENTS.filter((e) => e.types.includes(classType));

  const save = () => {
    if (!classType || !url.trim() || !events.length) return;
    update((d) => {
      const row: Webhook = {
        id: webhook?.id ?? nextId("wh", d.webhooks),
        classType,
        url: url.trim(),
        events,
        authHeader: authHeader.trim() || "{}",
      };
      return { ...d, webhooks: webhook ? d.webhooks.map((w) => (w.id === webhook.id ? row : w)) : [...d.webhooks, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="webhook-create-modal"
      title={webhook ? "Editar Webhook" : "Novo Webhook"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="webhook-create-modal" form="webhook-create-form" icon={<SaveIcon />} label={webhook ? "Salvar" : "Criar Webhook"} />
        </>
      }
    >
      <form
        id="webhook-create-form"
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div>
          <Combobox
            id="class_type"
            label="Tipo de registro"
            options={WEBHOOK_TYPES}
            value={classType}
            onChange={pickType}
            placeholder="Selecione..."
            required
          />
        </div>

        <div>
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_url">
              URL <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input
                id="id_url"
                className="hinput"
                type="url"
                name="url"
                placeholder="https://exemplo.com/webhook"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <p className="hinput-desc">
              Use {"{register_key}"} para incluir a chave do registro na URL, ex: https://exemplo.com/webhook/{"{register_key}"}/
            </p>
          </div>
        </div>

        {classType ? (
          <div>
            <label className="hinput-label">
              Eventos <span className="hinput-req">*</span>
            </label>
            <div className="hcheckbox-stack mt-2">
              {available.map((e) => (
                <div key={e.value}>
                  <label className="hcheckbox">
                    <input
                      type="checkbox"
                      className="hcheckbox-input"
                      name="events"
                      value={e.value}
                      checked={events.includes(e.value)}
                      onChange={() => setEvents((list) => (list.includes(e.value) ? list.filter((v) => v !== e.value) : [...list, e.value]))}
                    />
                    <span className="hcheckbox-box" aria-hidden="true">
                      <CheckboxMark />
                      <span className="hcheckbox-dash" aria-hidden="true" />
                    </span>
                    <span className="hcheckbox-label">{e.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="halert halert--accent" role="alert">
            <span className="halert-indicator" aria-hidden="true">
              <InfoIcon className="w-5 h-5" />
            </span>
            <div className="halert-content">
              <p className="halert-description">Selecione primeiro o tipo de registro para escolher os eventos disponíveis.</p>
            </div>
            <div className="halert-actions" />
          </div>
        )}

        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setShowAuth((s) => !s)}
          >
            <span className={`transition-transform${showAuth ? " rotate-90" : ""}`}>
              <ChevronRightIcon className="w-4 h-4" />
            </span>
            Configurações avançadas (opcional)
          </button>
          {showAuth && (
            <div className="mt-4">
              <label htmlFor="id_auth_header" className="hinput-label">
                Cabeçalho de Autenticação (JSON)
              </label>
              <textarea
                name="auth_header"
                id="id_auth_header"
                rows={3}
                className="htextarea mt-1.5 font-mono text-sm"
                placeholder='{"Authorization": "Bearer seu_token"}'
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
