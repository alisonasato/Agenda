"use client";

import { useState, type CSSProperties } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { Modal, ModalSubmit } from "../shared/Modal";
import { CheckCircleIcon, CloseCircleIcon, CopySolidIcon, DangerCircleIcon, EyeIcon, GlobeIcon, SearchSolidIcon, TrashIcon } from "../shared/icons";
import { fold } from "@/lib/seiri/select";
import { nextId, update, useData } from "@/lib/seiri/store";
import { DOMAIN_STATUSES, DOMAIN_STATUS_CHIPS, type OrgDomain } from "@/lib/seiri/types";

const COLUMNS = ["Domínio", "Situação", "Verificado em"];
const SLOTS = 10;

const now = () => new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }).replace(",", "");
/** The original hands out a TXT record once the domain is registered. */
const newTxt = () => `seiri-verificacao=${Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`;

/** "Gerenciamento de Domínios": the domains the organisation claims, and their DNS proof. */
export function Domains() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<OrgDomain | null>(null);
  const [removing, setRemoving] = useState<OrgDomain | null>(null);

  const rows = data.domains.filter((d) => {
    if (status && d.status !== status) return false;
    return !query.trim() || fold(d.name).includes(fold(query.trim()));
  });
  const filtered = Boolean(query.trim() || status);

  const reset = () => {
    setQuery("");
    setStatus("");
  };
  const remove = (id: string) => update((d) => ({ ...d, domains: d.domains.filter((x) => x.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
      <div className="hui-reveal">
        <div className="flex flex-col md:flex-row md:items-center gap-3 min-w-0">
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`}>
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por domínio"
              aria-label="Buscar por domínio"
              name="q"
              id="domain-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="w-full md:w-auto md:ml-auto flex items-center gap-2 min-w-0">
            <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
              <GlobeIcon />
              Novo Domínio
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="flex flex-wrap items-center gap-3 mb-3 min-w-0">
          <div id="domain-status-filters" className="hrail min-w-0">
            <div className="hrail-track">
              <div className="htaggroup--nowrap htaggroup">
                {DOMAIN_STATUSES.map((s) => (
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

        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Domínios Registrados</h2>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div id="domain-table-container">
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
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">{row.name}</span>
                      </td>
                      <td className="htable-cell">
                        <span className={`hchip ${DOMAIN_STATUS_CHIPS[row.status].tone} hchip--primary hchip--sm`}>
                          {DOMAIN_STATUS_CHIPS[row.status].label}
                        </span>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="text-sm text-gray-700 inter-regular">{row.verifiedAt || "—"}</span>
                      </td>
                      <td className="htable-cell htable-cell--end">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button type="button" className="btn-icon btn-icon-sm" title="Ver domínio" onClick={() => setDetail(row)}>
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Remover" onClick={() => setRemoving(row)}>
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
                  <GlobeIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">{filtered ? "Nenhum domínio encontrado" : "Nenhum domínio registrado"}</h3>
                  <p className="hempty-desc inter-regular">
                    {filtered
                      ? "Nenhum domínio corresponde à busca ou à situação selecionada. Ajuste ou limpe os filtros."
                      : "Registre um domínio para gerenciar os e-mails e os usuários da sua organização."}
                  </p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {creating && <CreateModal onClose={() => setCreating(false)} />}
      {detail && <DetailModal domain={detail} onClose={() => setDetail(null)} />}
      {removing && (
        <AlertDialog
          id="domain-delete-dialog"
          heading="Remover domínio?"
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
                Remover
              </button>
            </>
          }
        >
          <p>
            <strong>{removing.name}</strong> será removido e outra organização poderá registrá-lo; os dados dos usuários são preservados.
          </p>
        </AlertDialog>
      )}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [domain, setDomain] = useState("");

  const save = () => {
    if (!domain.trim()) return;
    update((d) => ({
      ...d,
      // A new domain starts unverified, waiting for the TXT record to be added.
      domains: [...d.domains, { id: nextId("dm", d.domains), name: domain.trim(), status: "pending", verifiedAt: "", txtValue: newTxt() }],
    }));
    onClose();
  };

  return (
    <Modal
      id="domain-create-modal"
      title="Registrar Domínio"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="domain-create-modal" form="domain-create-form" icon={<GlobeIcon />} label="Registrar" />
        </>
      }
    >
      {/* The original's form carries novalidate and checks the domain on the server. */}
      <form
        id="domain-create-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_domain">
            Domínio <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input
              id="id_domain"
              autoComplete="off"
              className="hinput"
              type="text"
              name="domain"
              placeholder="empresa.com.br"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <p className="hinput-desc">Após registrar, você receberá um registro TXT para adicionar ao DNS e validar a propriedade.</p>
        </div>
      </form>
    </Modal>
  );
}

/**
 * The "olhinho". The original loads this body from the server, and the verified account had no
 * domain, so what it shows is inferred from the register form's promise of a TXT record.
 */
function DetailModal({ domain, onClose }: { domain: OrgDomain; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const chip = DOMAIN_STATUS_CHIPS[domain.status];

  const verify = () => {
    update((d) => ({ ...d, domains: d.domains.map((x) => (x.id === domain.id ? { ...x, status: "verified", verifiedAt: now() } : x)) }));
    onClose();
  };

  const copy = () => {
    navigator.clipboard?.writeText(domain.txtValue).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      id="domain-detail-modal"
      title="Domínio"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Fechar
          </button>
          {domain.status !== "verified" && (
            <button type="button" className="hbtn hbtn--primary" onClick={verify}>
              <CheckCircleIcon />
              Verificar Agora
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
            <GlobeIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-gray-900 nunito-bold truncate">{domain.name}</h4>
            <span className={`hchip ${chip.tone} hchip--primary hchip--sm`}>{chip.label}</span>
          </div>
        </div>

        <div className="hcopyfield-field">
          <span className="hcopyfield-label">Registro TXT a adicionar no DNS</span>
          <div className="hcopyfield hcopyfield--iconbtn hcopyfield--mono hcopyfield--wrap">
            <code className="hcopyfield-value">{domain.txtValue}</code>
            <button type="button" className="hcopyfield-btn hbtn hbtn--tertiary" title={copied ? "Copiado!" : "Copiar"} aria-label="Copiar" onClick={copy}>
              <span className={`hcopyfield-btn-state${copied ? " hcopyfield-btn-state--done" : ""}`}>
                {copied ? <CheckCircleIcon className="w-4 h-4" /> : <CopySolidIcon className="w-4 h-4" />}
              </span>
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-xs text-gray-500 inter-regular">Verificado em</dt>
            <dd className="text-sm text-gray-900 inter-regular mt-0.5">{domain.verifiedAt || "—"}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
