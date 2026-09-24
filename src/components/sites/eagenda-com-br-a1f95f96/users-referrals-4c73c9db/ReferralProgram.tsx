"use client";

import { useState, type CSSProperties } from "react";
import { CheckReadIcon, CloseCircleIcon, CopySolidIcon, GiftIcon, SearchEmptyIcon, SearchSolidIcon } from "../shared/icons";

/** Mock of the account's referral link; the original carries a code of its own. */
const LINK = "https://seiri.com.br/users/create_user/?ref=A1B2C3D4E5F6";

const KPIS: [string, string, string][] = [
  ["Total de indicações", "0", "0 pendentes"],
  ["Total em créditos", "R$ 0,00", "creditados na sua conta"],
  ["1º pagamento", "0", "indicações recompensadas"],
  ["Bônus fidelidade", "0", "6 meses pagando"],
];
const STATUSES: [string, string][] = [
  ["", "Todos"],
  ["pending", "Pendente"],
  ["first_payment", "1º Pagamento"],
  ["loyalty_rewarded", "Fidelizado"],
  ["cancelled", "Cancelado"],
];
const COLUMNS: [string, string][] = [
  ["Organização", "htable-col"],
  ["Status", "htable-col"],
  ["Recompensa 1º Pgto", "htable-col htable-col--num htable-col--end"],
  ["Bônus Fidelidade", "htable-col htable-col--num htable-col--end"],
  ["Pagamentos", "htable-col htable-col--num htable-col--center"],
  ["Data", "htable-col"],
];
const SLOTS = 10;

/** Conta › Programa de Indicações: the referral link, its counters and the referral history. */
export function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filtered = !!query || status !== "";

  return (
    <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
      <div className="hui-reveal">
        <div className="hsection hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">Seu link de indicação</h2>
              <p className="hsection-desc">
                Quem se cadastrar por este link ganha 50% de desconto no 1º mês, e você recebe 1 mês do plano em créditos — mais 1 mês se o indicado permanecer
                6 meses pagando.
              </p>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            <div className="hcopyfield-field">
              <div className="hcopyfield hcopyfield--mono">
                <code className="hcopyfield-value">{LINK}</code>
                <button
                  type="button"
                  className="hcopyfield-btn hbtn hbtn--tertiary"
                  title="Copiar"
                  aria-label="Copiar"
                  onClick={() => {
                    navigator.clipboard?.writeText(LINK).catch(() => {});
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <span className="hcopyfield-btn-state hcopyfield-btn-state--done">
                      <CheckReadIcon className="w-4 h-4" />
                      <span>Copiado!</span>
                    </span>
                  ) : (
                    <span className="hcopyfield-btn-state">
                      <CopySolidIcon className="w-4 h-4" />
                      <span>Copiar</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="hkpi-group">
          {KPIS.map(([label, value, caption]) => (
            <div key={label} className="hui-card hui-card--flush hkpi">
              <div className="hkpi-body hkpi-body--trend">
                <p className="hkpi-label">{label}</p>
                <div className="hkpi-value-row">
                  <span className="hkpi-value">
                    {value.startsWith("R$") ? (
                      <>
                        <span className="hkpi-prefix">R$</span> {value.slice(3)}
                      </>
                    ) : (
                      value
                    )}
                  </span>
                </div>
                <p className="hkpi-caption">{caption}</p>
              </div>
              <div className="hkpi-spark">
                <div className="hkpi-spark-empty" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 hui-reveal" style={{ animationDelay: ".08s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Histórico de indicações</h2>
            <p className="hwidget-desc">Empresas que se cadastraram pelo seu link.</p>
          </div>
          <div className="hwidget-actions" />
        </div>

        <form id="formFilter" className="mt-3 flex flex-col md:flex-row md:items-center gap-3 min-w-0" onSubmit={(e) => e.preventDefault()}>
          <label className={`hui-search w-full md:w-72 md:min-w-[12rem] min-w-0${query ? " has-query" : ""}`} id="referral-search">
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar por empresa ou e-mail do indicado"
              aria-label="Buscar por empresa ou e-mail do indicado"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
          <div className="w-full md:w-auto md:ml-auto min-w-0">
            <div id="referral-quick-filters" className="hrail min-w-0">
              <div className="hrail-track">
                <div className="htaggroup--nowrap htaggroup">
                  {STATUSES.map(([value, label]) => (
                    <button key={label} type="button" className={`htag${status === value ? " htag--active" : ""}`} onClick={() => setStatus(value)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        <div id="referral-active-filters" className="mt-3" />

        <div className="mt-4">
          <div id="referral-table">
            <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.5rem", "--htable-head-h": "38px" } as CSSProperties}>
              <div className="htable-scroll">
                <table className="htable-table w-full htable-fixed">
                  <thead>
                    <tr>
                      {COLUMNS.map(([label, cls]) => (
                        <th key={label} className={cls}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: SLOTS }, (_, i) => (
                      <tr key={i} className="htable-row--empty" aria-hidden="true">
                        {Array.from({ length: COLUMNS.length }, (_, j) => (
                          <td key={j} className="htable-cell" />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="htable-empty" role="status" aria-live="polite">
                {filtered ? (
                  <div className="hempty hempty--inline hui-reveal">
                    <SearchEmptyIcon className="hempty-icon" />
                    <h3 className="hempty-title nunito-bold">Nenhuma indicação encontrada</h3>
                    <p className="hempty-desc inter-regular">Nenhuma indicação corresponde à busca ou ao status selecionado. Ajuste ou limpe os filtros.</p>
                  </div>
                ) : (
                  <div className="hempty hempty--inline hui-reveal">
                    <GiftIcon className="hempty-icon" />
                    <h3 className="hempty-title nunito-bold">Nenhuma indicação ainda</h3>
                    <p className="hempty-desc inter-regular">Compartilhe seu link e as empresas que se cadastrarem por ele aparecerão aqui.</p>
                  </div>
                )}
              </div>
              <div className="htable-footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
