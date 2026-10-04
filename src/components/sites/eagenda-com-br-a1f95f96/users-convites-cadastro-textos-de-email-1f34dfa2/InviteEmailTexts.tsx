"use client";

import { useState } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { Modal, ModalSubmit } from "../shared/Modal";
import { ScrollRail } from "../shared/ScrollRail";
import { Select } from "../shared/Select";
import { CheckboxMark, DangerCircleIcon, GridPlusIcon, LetterIcon, PenIcon, SaveIcon, TrashIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { nextId, update, useData } from "@/lib/seiri/store";
import { INVITE_EMAIL_DEFAULTS, INVITE_EMAIL_KINDS, INVITE_EMAIL_VARS, type InviteEmailTemplate } from "@/lib/seiri/types";

const COLUMNS = ["Nome", "Momento", "Assunto", "Padrão"];
const SLOTS = 6;

/** "Textos do convite": the reusable e-mail texts the invite flow picks from. */
export function InviteEmailTexts() {
  const data = useData();
  const [editing, setEditing] = useState<InviteEmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<InviteEmailTemplate | null>(null);

  const rows = data.inviteEmails;
  const remove = (id: string) =>
    update((d) => ({
      ...d,
      inviteEmails: d.inviteEmails.filter((t) => t.id !== id),
      // A convite pointing at the removed text falls back to the system's default.
      invites: d.invites.map((i) => (i.templateId === id ? { ...i, templateId: "" } : i)),
    }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0 hui-reveal">
        <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
          <LetterIcon />
          Novo texto
        </button>
        <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
          <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
            <a href={ROUTES.convitesCadastro} className="hbtn hbtn--ghost hbtn--sm">
              <GridPlusIcon />
              <span className="hactionbar-label">Convites</span>
            </a>
          </ScrollRail>
        </div>
      </div>

      <div className="mt-6 md:mt-8 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Textos disponíveis</h2>
            <p className="hwidget-desc">O texto marcado como padrão vem pré-selecionado ao criar um convite; no convite dá para escolher outro.</p>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div className="mt-3">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`}>
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
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">{row.name}</span>
                      </td>
                      <td className="htable-cell htable-cell--muted">{INVITE_EMAIL_KINDS.find((k) => k.value === row.kind)?.label ?? row.kind}</td>
                      <td className="htable-cell htable-cell--muted">{row.subject}</td>
                      <td className="htable-cell">
                        {row.isDefault ? (
                          <span className="hchip hchip--success hchip--primary hchip--sm">Padrão</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
                  <LetterIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum texto criado ainda</h3>
                  <p className="hempty-desc inter-regular">Sem um texto próprio, os convites saem com a mensagem padrão do sistema.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {(creating || editing) && <TextModal template={editing ?? undefined} onClose={() => (editing ? setEditing(null) : setCreating(false))} />}
      {removing && (
        <AlertDialog
          id="email-template-delete-dialog"
          heading="Excluir texto?"
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
            O texto <strong className="font-semibold">{removing.name}</strong> sai da lista. Os convites que o usavam voltam para a mensagem padrão do sistema.
          </p>
        </AlertDialog>
      )}
    </div>
  );
}

function TextModal({ template, onClose }: { template?: InviteEmailTemplate; onClose: () => void }) {
  const [kind, setKind] = useState(template?.kind ?? "INVITE");
  const [name, setName] = useState(template?.name ?? "");
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false);
  const [subject, setSubject] = useState(template?.subject ?? INVITE_EMAIL_DEFAULTS.INVITE.subject);
  const [body, setBody] = useState(template?.body ?? "");

  /** The original only overwrites the subject while it is still one of the suggestions. */
  const isSuggestion = (value: string) => !value.trim() || Object.values(INVITE_EMAIL_DEFAULTS).some((d) => d.subject === value.trim());

  const pickKind = (next: string) => {
    setKind(next);
    if (isSuggestion(subject)) setSubject(INVITE_EMAIL_DEFAULTS[next].subject);
  };

  const save = () => {
    if (!name.trim() || !subject.trim()) return;
    update((d) => {
      const row: InviteEmailTemplate = {
        id: template?.id ?? nextId("it", d.inviteEmails),
        kind,
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        isDefault,
      };
      const next = template ? d.inviteEmails.map((t) => (t.id === template.id ? row : t)) : [...d.inviteEmails, row];
      // Only one text per moment can be the default one.
      return { ...d, inviteEmails: next.map((t) => (isDefault && t.id !== row.id && t.kind === kind ? { ...t, isDefault: false } : t)) };
    });
    onClose();
  };

  return (
    <Modal
      id="email-template-modal"
      title={template ? "Editar texto" : "Novo texto"}
      size="xl"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="email-template-modal" form="email-template-modal-form" icon={<SaveIcon />} label={template ? "Salvar alterações" : "Criar texto"} />
        </>
      }
    >
      <form
        id="email-template-modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Identificação</h3>
          </div>
          <div className="hformsection-body">
            <div className="space-y-4">
              <Select
                id="id_kind"
                name="kind"
                label="Momento"
                value={kind}
                onChange={pickKind}
                options={INVITE_EMAIL_KINDS.map((k) => ({ value: k.value, label: k.label }))}
              />
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_template_name">
                  Nome do texto <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input
                    id="id_template_name"
                    className="hinput"
                    type="text"
                    name="name"
                    placeholder="Ex.: Boas-vindas"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="hcheckbox-stack">
                <label className="hcheckbox">
                  <input type="checkbox" className="hcheckbox-input" name="is_default" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                  <span className="hcheckbox-box" aria-hidden="true">
                    <CheckboxMark />
                    <span className="hcheckbox-dash" aria-hidden="true" />
                  </span>
                  <span className="hcheckbox-label">Usar como padrão</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Mensagem</h3>
          </div>
          <div className="hformsection-body">
            <div className="space-y-4">
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_subject">
                  Assunto <span className="hinput-req">*</span>
                </label>
                <div className="hinput-wrap">
                  <input id="id_subject" className="hinput" type="text" name="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="hinput-label" htmlFor="id_body">
                  Mensagem extra
                </label>
                {/* Switching the moment moves the placeholder, never the text already typed. */}
                <textarea
                  className="htextarea"
                  rows={12}
                  name="body"
                  id="id_body"
                  placeholder={INVITE_EMAIL_DEFAULTS[kind].body}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <p className="hinput-desc">
                  Este texto é ACRESCENTADO à mensagem padrão, antes da assinatura — ele não substitui o que o sistema precisa dizer (link, prazo, próximo
                  passo).
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="hformsection">
          <div className="hformsection-head">
            <h3 className="hformsection-title">Variáveis disponíveis</h3>
            <p className="hformsection-desc">Cada momento aceita as suas — o link de cadastro não existe num texto de aprovação, por exemplo.</p>
          </div>
          <div className="hformsection-body">
            <div className="space-y-3">
              {INVITE_EMAIL_KINDS.map((k) => (
                <div key={k.value}>
                  <div className="text-xs text-gray-500 inter-regular mb-1">{k.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {INVITE_EMAIL_VARS[k.value].map((v) => (
                      <span key={v.name} title={v.title} className="hchip hchip--default hchip--soft hchip--sm">
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}
