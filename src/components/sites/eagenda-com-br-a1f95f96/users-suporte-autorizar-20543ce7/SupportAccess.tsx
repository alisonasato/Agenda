"use client";

import { useState, type CSSProperties } from "react";
import { ROUTES } from "../shared/Sidebar";
import { Modal } from "../shared/Modal";
import {
  CheckReadIcon,
  CheckboxMark,
  ClockSolidIcon,
  CopySolidIcon,
  KeyIcon,
  RefreshIcon,
  SearchEmptyIcon,
  ShieldSplitIcon,
  StarsIcon,
  WarningTriangleIcon,
} from "../shared/icons";

const STEPS = [
  { title: "Gere o código", desc: "Leia o termo de autorização, aceite e o código é criado na hora." },
  { title: "Envie ao suporte", desc: "Copie o código e passe para o atendente pelo chat ou WhatsApp." },
  { title: "Acesso auditado", desc: "O atendente entra na sua conta com tudo registrado. Expira em 2 horas ou no primeiro uso." },
];

const PRIVACY = [
  "Todas as ações do suporte ficam registradas e auditáveis",
  "Dados financeiros e senhas ficam ocultos para o atendente",
  "O código expira em 2 horas ou no primeiro uso",
  "Somente o proprietário ou gestor da conta pode gerar o código",
  "Gerar um novo código revoga o anterior a qualquer momento",
];

const COLUMNS = ["Atendente", "Início", "Páginas", "Duração", "Situação"];
const SLOTS = 5;

/** Mock of the original's `/users/suporte/gerar-token/`: six characters and a two-hour deadline. */
function makeToken() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const token = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  const at = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { token, expires: `${pad(at.getDate())}/${pad(at.getMonth() + 1)}/${at.getFullYear()} às ${pad(at.getHours())}:${pad(at.getMinutes())}` };
}

/** The terms the original shows before creating a token. */
function TermsModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <Modal
      id="support-terms-modal"
      title="Termo de Autorização de Acesso ao Suporte"
      size="2xl"
      onClose={onClose}
      footer={
        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="hcheckbox">
            <input type="checkbox" id="terms-accept" className="hcheckbox-input" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span className="hcheckbox-box" aria-hidden="true">
              <CheckboxMark />
              <span className="hcheckbox-dash" aria-hidden="true" />
            </span>
            <span className="hcheckbox-label">Li e concordo com os termos.</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
            <button type="button" className="justify-center hbtn hbtn--tertiary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" id="accept-generate-btn" className="justify-center hbtn hbtn--primary" disabled={!accepted} onClick={onAccept}>
              <KeyIcon />
              Aceitar e gerar código
            </button>
          </div>
        </div>
      }
    >
      <div className="text-sm text-gray-600 inter-regular leading-relaxed">
        <p className="mb-2">
          Ao gerar o código de acesso, você autoriza a equipe de suporte da <strong>Seiri</strong> a acessar temporariamente a sua conta para diagnosticar e
          resolver o problema relatado. Leia e aceite as condições abaixo antes de continuar:
        </p>
        <ol className="pl-3 mb-2">
          <li className="mb-2">
            <strong>Escopo do acesso.</strong> A equipe poderá visualizar e navegar na sua conta no modo &quot;ver como cliente&quot; — agendamentos,
            calendários, clientes/contatos, configurações, notificações e integrações. Operações de pagamento e dados financeiros permanecem bloqueados para o
            suporte.
          </li>
          <li className="mb-2">
            <strong>Validade e uso único.</strong> O código é válido por 2 horas e pode ser usado uma única vez. A sessão encerra automaticamente após 30
            minutos de inatividade ou quando o atendente sai do modo de acesso.
          </li>
          <li className="mb-2">
            <strong>Auditoria.</strong> Toda a sessão é registrada — data, atendente, duração e páginas acessadas — e você pode consultar esse histórico a
            qualquer momento nesta tela.
          </li>
          <li className="mb-2">
            <strong>Dados pessoais (LGPD).</strong> Você reconhece que o acesso poderá expor dados pessoais de seus clientes e contatos e autoriza o tratamento
            desses dados pela equipe de suporte exclusivamente para fins de atendimento, nos termos da Política de Privacidade.
          </li>
          <li className="mb-2">
            <strong>Revogação.</strong> Você pode revogar o acesso a qualquer momento gerando um novo código (o que invalida o anterior) ou aguardando a
            expiração.
          </li>
          <li className="mb-2">
            <strong>Responsabilidade.</strong> Você declara ser proprietário(a) ou administrador(a) autorizado(a) da conta, com competência para conceder este
            acesso.
          </li>
        </ol>
        <p className="text-muted small mb-0">Termo versão 1.0. O aceite é registrado com data, hora e identificação para fins de auditoria.</p>
      </div>
    </Modal>
  );
}

/** Ajuda › Autorizar Suporte: generates the one-time code that lets support into the account. */
export function SupportAccess() {
  const [terms, setTerms] = useState(false);
  const [result, setResult] = useState<{ token: string; expires: string } | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10">
      <div className="space-y-3 mb-6 hui-reveal">
        <div className="halert halert--warning" role="alert">
          <span className="halert-indicator" aria-hidden="true">
            <WarningTriangleIcon className="w-[18px] h-[18px]" />
          </span>
          <div className="halert-content">
            <p className="halert-title">Sobre o prazo de atendimento</p>
            <p className="halert-description">
              Vamos trabalhar com empenho para resolver o seu problema o mais rápido possível. No entanto, como sua conta não possui o{" "}
              <strong>Suporte Avançado</strong>, não garantimos um prazo de atendimento (SLA) de até 8 horas úteis.
            </p>
          </div>
          <div className="halert-actions">
            <a href={ROUTES.planos} className="hbtn hbtn--primary hbtn--sm">
              <StarsIcon />
              Contratar Suporte Avançado
            </a>
          </div>
        </div>
      </div>

      <div>
        <div className="hsection hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">Gerar código de acesso</h2>
              <p className="hsection-desc">Válido por 2 horas e utilizável uma única vez.</p>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            {!result ? (
              <div id="support-token-idle">
                <button type="button" id="generate-btn" className="hbtn hbtn--primary" onClick={() => setTerms(true)}>
                  <KeyIcon />
                  Gerar código agora
                </button>
              </div>
            ) : (
              <div id="support-token-result">
                <div className="rounded-2xl bg-[color:var(--color-surface-secondary,#f7f9fb)] px-6 py-8 text-center">
                  <p className="text-xs uppercase tracking-wide text-gray-400 inter-regular mb-3">Seu código de acesso</p>
                  <p id="support-token-value" className="text-4xl md:text-5xl nunito-black tracking-[0.2em] text-gray-900 select-all">
                    {result.token}
                  </p>
                  <p id="support-token-expiry" className="mt-3 text-xs text-gray-500 inter-regular inline-flex items-center gap-1.5">
                    <ClockSolidIcon className="w-3.5 h-3.5" />
                    <span>Expira em {result.expires}</span>
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    id="copy-token-btn"
                    className="hbtn hbtn--primary"
                    onClick={() => {
                      navigator.clipboard?.writeText(result.token).catch(() => {});
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2500);
                    }}
                  >
                    <CopySolidIcon />
                    <span>{copied ? "Copiado!" : "Copiar código"}</span>
                  </button>
                  <button type="button" className="hbtn hbtn--secondary" onClick={() => setTerms(true)}>
                    <RefreshIcon />
                    Gerar novo
                  </button>
                </div>
                <div className="mt-4">
                  <div className="halert halert--warning" role="alert">
                    <span className="halert-indicator" aria-hidden="true">
                      <WarningTriangleIcon className="w-[18px] h-[18px]" />
                    </span>
                    <div className="halert-content">
                      <p className="halert-description">Copie o código agora: ele é exibido uma única vez e não pode ser recuperado depois.</p>
                    </div>
                    <div className="halert-actions" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hsection h-full hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">Como funciona</h2>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            <ol className="hstepper hstepper--md hstepper--vertical" role="list" aria-label="Como funciona">
              {STEPS.map((step, i) => (
                <li key={step.title} className="hstepper__step" data-status="inactive">
                  <div className="hstepper__step-button">
                    <span className="hstepper__indicator">
                      <span className="hstepper__icon" aria-hidden="true">
                        <span className="hstepper__num">{i + 1}</span>
                        <span className="hstepper__check">
                          <CheckReadIcon className="w-full h-full" />
                        </span>
                      </span>
                    </span>
                    <span className="hstepper__content">
                      <span className="hstepper__title">{step.title}</span>
                      <span className="hstepper__description">{step.desc}</span>
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <span className="hstepper__separator" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="hsection h-full hui-card hui-card--flush">
          <div className="hsection-head">
            <div className="hsection-titles">
              <h2 className="hsection-title">Sua privacidade está protegida</h2>
            </div>
            <div className="hsection-actions" />
          </div>
          <div className="hsection-body">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-2.5">
              {PRIVACY.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600 inter-regular">
                  <CheckReadIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[color:var(--color-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 hui-reveal" style={{ animationDelay: ".06s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Histórico de acessos ao suporte</h2>
            <p className="hwidget-desc">Cada vez que a equipe de suporte acessou sua conta.</p>
          </div>
          <div className="hwidget-actions" />
        </div>
        <div className="mt-4">
          <div className="htable htable-is-empty" style={{ "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className={`htable-col${c === "Páginas" ? " htable-col--num" : ""}`}>
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
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <ShieldSplitIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nenhum acesso de suporte registrado</h3>
                <p className="hempty-desc inter-regular">O histórico aparecerá aqui quando a equipe de suporte acessar sua conta.</p>
              </div>
              {/* The original keeps the filtered copy in the markup, hidden, for when the history has rows. */}
              <div hidden>
                <div className="hempty hempty--inline hui-reveal">
                  <SearchEmptyIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum resultado encontrado</h3>
                  <p className="hempty-desc inter-regular">
                    Nenhum registro corresponde aos filtros aplicados. Ajuste ou limpe os filtros para ver mais resultados.
                  </p>
                </div>
              </div>
            </div>
            <div className="htable-footer">
              <div className="htable-pagination" hidden />
            </div>
          </div>
        </div>
      </div>

      {terms && (
        <TermsModal
          onClose={() => setTerms(false)}
          onAccept={() => {
            setResult(makeToken());
            setTerms(false);
            setCopied(false);
          }}
        />
      )}
    </div>
  );
}
