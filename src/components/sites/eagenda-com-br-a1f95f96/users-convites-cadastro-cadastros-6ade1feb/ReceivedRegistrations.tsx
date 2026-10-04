"use client";

import { useState, type CSSProperties } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { Modal } from "../shared/Modal";
import { ScrollRail } from "../shared/ScrollRail";
import { CheckboxMark, CheckCircleIcon, CloseCircleIcon, EyeIcon, GridPlusIcon, InboxIcon, SearchSolidIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { fold } from "@/lib/seiri/select";
import { update, useData } from "@/lib/seiri/store";
import { INVITE_FIELDS, SUBMISSION_STATUSES, SUBMISSION_STATUS_TONES, type RegistrationSubmission } from "@/lib/seiri/types";

const COLUMNS = ["Cliente", "Convite", "Status", "Recebido em"];
const SLOTS = 10;
/** Only a pending row can still be decided, so only it is selectable. */
const isPending = (s: RegistrationSubmission) => s.status === "PENDING";

type Decision = { kind: "approve" | "reject"; rows: RegistrationSubmission[] };

/** "Cadastros de Clientes": what came in through the invite links, waiting for approval. */
export function ReceivedRegistrations() {
  const data = useData();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [detail, setDetail] = useState<RegistrationSubmission | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  const rows = data.submissions.filter((s) => {
    if (status && s.status !== status) return false;
    return !search.trim() || fold(`${s.name} ${s.email}`).includes(fold(search.trim()));
  });
  const filtered = Boolean(search.trim() || status);
  const pending = rows.filter(isPending);
  const selected = rows.filter((s) => picked.includes(s.id) && isPending(s));

  const reset = () => {
    setSearch("");
    setStatus("");
  };

  const decide = (kind: "approve" | "reject", ids: string[], reason: string) =>
    update((d) => ({
      ...d,
      submissions: d.submissions.map((s) =>
        ids.includes(s.id) ? { ...s, status: kind === "approve" ? "APPROVED" : "REJECTED", reason: kind === "reject" ? reason : undefined } : s,
      ),
    }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0 hui-reveal">
        <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${search ? " has-query" : ""}`}>
          <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            className="hui-search-input"
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar por nome ou e-mail"
            name="search"
            id="submission-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
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
        <div className="flex flex-wrap items-center gap-3 mb-3 min-w-0">
          <div id="status-quick-filters" className="hrail min-w-0">
            <div className="hrail-track">
              <div className="htaggroup--nowrap htaggroup">
                {SUBMISSION_STATUSES.map((s) => (
                  <button key={s.value} type="button" className={`htag${s.value === status ? " htag--active" : ""}`} onClick={() => setStatus(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={reset}>
              <CloseCircleIcon className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        {selected.length > 0 && (
          <div id="submission-bulk-bar" className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm text-gray-700 inter-regular">
              <strong>{selected.length}</strong> selecionado(s)
            </span>
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setDecision({ kind: "approve", rows: selected })}>
              <CheckCircleIcon />
              Aprovar selecionados
            </button>
            <button type="button" className="hbtn hbtn--danger hbtn--sm" onClick={() => setDecision({ kind: "reject", rows: selected })}>
              <CloseCircleIcon className="w-4 h-4" />
              Rejeitar selecionados
            </button>
            <button type="button" className="hbtn hbtn--tertiary hbtn--sm" onClick={() => setPicked([])}>
              Limpar seleção
            </button>
          </div>
        )}

        <div id="submission-table-container">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full">
                <thead>
                  <tr>
                    <th className="htable-col htable-col--check">
                      <label className="hcheckbox hcheckbox--sm">
                        <input
                          type="checkbox"
                          className="hcheckbox-input"
                          aria-label="Selecionar todos os pendentes"
                          title="Selecionar todos os pendentes"
                          disabled={!pending.length}
                          checked={pending.length > 0 && selected.length === pending.length}
                          onChange={(e) => setPicked(e.target.checked ? pending.map((s) => s.id) : [])}
                        />
                        <span className="hcheckbox-box" aria-hidden="true">
                          <CheckboxMark />
                          <span className="hcheckbox-dash" aria-hidden="true" />
                        </span>
                      </label>
                    </th>
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
                      <td className="htable-cell htable-cell--check">
                        {isPending(row) && (
                          <label className="hcheckbox hcheckbox--sm">
                            <input
                              type="checkbox"
                              className="hcheckbox-input"
                              aria-label={`Selecionar ${row.name}`}
                              checked={picked.includes(row.id)}
                              onChange={(e) => setPicked((p) => (e.target.checked ? [...p, row.id] : p.filter((id) => id !== row.id)))}
                            />
                            <span className="hcheckbox-box" aria-hidden="true">
                              <CheckboxMark />
                              <span className="hcheckbox-dash" aria-hidden="true" />
                            </span>
                          </label>
                        )}
                      </td>
                      <td className="htable-cell">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 inter-semibold truncate">{row.name}</p>
                          <p className="text-xs text-gray-500 inter-regular truncate">{row.email}</p>
                        </div>
                      </td>
                      <td className="htable-cell htable-cell--muted">{data.invites.find((i) => i.id === row.inviteId)?.name ?? "—"}</td>
                      <td className="htable-cell">
                        <span className={`hchip ${SUBMISSION_STATUS_TONES[row.status]} hchip--primary hchip--sm`}>
                          {SUBMISSION_STATUSES.find((s) => s.value === row.status)?.label}
                        </span>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="text-sm text-gray-700 inter-regular">{row.receivedAt}</span>
                      </td>
                      <td className="htable-cell htable-cell--end">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon btn-icon-sm" title="Conferir cadastro" onClick={() => setDetail(row)}>
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {isPending(row) && (
                            <>
                              <button
                                type="button"
                                className="btn-icon btn-icon-sm btn-icon-flat"
                                title="Aprovar"
                                onClick={() => setDecision({ kind: "approve", rows: [row] })}
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-icon-sm btn-icon-danger"
                                title="Rejeitar"
                                onClick={() => setDecision({ kind: "reject", rows: [row] })}
                              >
                                <CloseCircleIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 2 }, (_, j) => (
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
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum cadastro encontrado" : "Nenhum cadastro recebido ainda"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered
                      ? "Ajuste a busca ou o status para ver outros cadastros."
                      : "Quando alguém preencher o formulário de um convite, o cadastro aparece aqui para aprovação."}
                  </p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {detail && (
        <DetailModal
          row={detail}
          inviteName={data.invites.find((i) => i.id === detail.inviteId)?.name ?? "—"}
          onClose={() => setDetail(null)}
          onDecide={(kind) => {
            setDetail(null);
            setDecision({ kind, rows: [detail] });
          }}
        />
      )}
      {decision && (
        <DecisionDialog
          decision={decision}
          onClose={() => setDecision(null)}
          onConfirm={(reason) => {
            decide(
              decision.kind,
              decision.rows.map((r) => r.id),
              reason,
            );
            setPicked([]);
            setDecision(null);
          }}
        />
      )}
    </div>
  );
}

/** The "olhinho": the whole submission, and the decision buttons while it is still pending. */
function DetailModal({
  row,
  inviteName,
  onClose,
  onDecide,
}: {
  row: RegistrationSubmission;
  inviteName: string;
  onClose: () => void;
  onDecide: (kind: "approve" | "reject") => void;
}) {
  const lines: [string, string][] = [
    ["E-mail", row.email],
    ["Convite", inviteName],
    ["Recebido em", row.receivedAt],
    ...INVITE_FIELDS.filter((f) => row.answers[f.id]).map((f) => [f.label, row.answers[f.id]] as [string, string]),
    ...(row.reason ? ([["Motivo da rejeição", row.reason]] as [string, string][]) : []),
  ];

  return (
    <Modal
      id="submission-detail-modal"
      title={row.name}
      size="xl"
      onClose={onClose}
      footer={
        <>
          {isPending(row) && (
            <div id="submission-detail-actions" className="flex items-center gap-2">
              <button type="button" className="hbtn hbtn--danger" onClick={() => onDecide("reject")}>
                <CloseCircleIcon className="w-4 h-4" />
                Rejeitar
              </button>
              <button type="button" className="hbtn hbtn--primary" onClick={() => onDecide("approve")}>
                <CheckCircleIcon />
                Aprovar
              </button>
            </div>
          )}
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Fechar
          </button>
        </>
      }
    >
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {lines.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-500 inter-regular">{label}</dt>
            <dd className="text-sm text-gray-900 inter-regular mt-0.5 break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

function DecisionDialog({ decision, onClose, onConfirm }: { decision: Decision; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const { kind, rows } = decision;
  const bulk = rows.length > 1;
  const id = `submission-${bulk ? "bulk-" : ""}${kind}-dialog`;
  const name = rows[0].name;

  return (
    <AlertDialog
      id={id}
      tone={kind === "approve" ? "success" : "danger"}
      heading={
        kind === "approve"
          ? bulk
            ? "Aprovar os cadastros selecionados?"
            : "Aprovar cadastro?"
          : bulk
            ? "Rejeitar os cadastros selecionados?"
            : "Rejeitar cadastro?"
      }
      icon={kind === "approve" ? <CheckCircleIcon className="w-6 h-6" /> : <CloseCircleIcon className="w-6 h-6" />}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={`hbtn ${kind === "approve" ? "hbtn--primary" : "hbtn--danger"}`}
            onClick={() => onConfirm(notify ? reason.trim() : "")}
          >
            {kind === "approve" ? "Aprovar" : "Rejeitar"}
          </button>
        </>
      }
    >
      {kind === "approve" ? (
        bulk ? (
          <p>
            <strong className="font-semibold">{rows.length}</strong> cadastro(s) viram acesso e cada pessoa recebe o aviso por e-mail.
          </p>
        ) : (
          <p>
            O acesso de <strong className="font-semibold">{name}</strong> será criado e a pessoa receberá o aviso por e-mail.
          </p>
        )
      ) : (
        <div>
          {bulk ? (
            <p>
              <strong className="font-semibold">{rows.length}</strong> cadastro(s) não viram acesso.
            </p>
          ) : (
            <p>
              O cadastro de <strong className="font-semibold">{name}</strong> não vira acesso.
            </p>
          )}
          <div className="mt-3">
            <label className="hinput-label" htmlFor={`${id}-reason`}>
              Motivo (opcional)
            </label>
            <textarea className="htextarea" rows={3} id={`${id}-reason`} name="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="mt-3">
            <label className="hcheckbox hcheckbox--sm">
              <input type="checkbox" className="hcheckbox-input" name="notify" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span className="hcheckbox-box" aria-hidden="true">
                <CheckboxMark />
                <span className="hcheckbox-dash" aria-hidden="true" />
              </span>
              <span className="hcheckbox-label">Avisar a pessoa por e-mail</span>
            </label>
            {reason.trim().length > 0 && <p className="text-xs text-gray-500 inter-regular mt-1">O motivo preenchido acima vai junto no e-mail.</p>}
          </div>
        </div>
      )}
    </AlertDialog>
  );
}
