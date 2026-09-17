"use client";

import { useRef, useState } from "react";
import {
  CalendarIcon,
  CaretDownIcon,
  ChatIcon,
  CheckReadIcon,
  CloseCircleIcon,
  LinkIcon,
  SearchSolidIcon,
  SettingsIcon,
  StarsIcon,
  WidgetIcon,
} from "../shared/icons";
import { useDismiss } from "../shared/useDismiss";

// Mock organisation: the live page builds every link from the account's own slug.
const ORG = "minhaempresa";
const MAIN_LINK = `https://${ORG}.eagenda.com.br`;
const ALL_AGENDAS_LINK = `https://eagenda.com.br/agendamentos/incluir/${ORG}/horarios`;
const AGENDAS = [{ id: "18078", name: "Agenda Principal", slug: "" }];

function LinkField({ url }: { url: string }) {
  const copy = () => navigator.clipboard?.writeText(url).catch(() => {});
  return (
    <div className="hlinkfield">
      <span className="hlinkfield-url" title={url}>
        {url}
      </span>
      <div className="hlinkfield-actions">
        <button type="button" title="Copiar link" aria-label="Copiar link" className="hbtn hbtn--ghost hbtn--sm hbtn--icon" onClick={copy}>
          <WidgetIcon className="w-4 h-4" />
        </button>
        <button type="button" title="Compartilhar no WhatsApp" aria-label="Compartilhar no WhatsApp" className="hbtn hbtn--ghost hbtn--sm hbtn--icon">
          <ChatIcon className="w-4 h-4" />
        </button>
        <button type="button" title="Visualizar QR Code" aria-label="Visualizar QR Code" className="hbtn hbtn--ghost hbtn--sm hbtn--icon">
          <SettingsIcon className="w-4 h-4" />
        </button>
        <a href={url} title="Abrir link" aria-label="Abrir link" target="_blank" rel="noopener noreferrer" className="hbtn hbtn--ghost hbtn--sm hbtn--icon">
          <LinkIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

/** "Selecionar agendas": multi-select with chips (.hms in the original). */
function AgendaSelect({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  const options = AGENDAS.map((a) => ({ id: a.id, label: a.slug ? a.name : `${a.name} (sem identificador)` }));
  const hits = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (id: string) => onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);

  return (
    <div className="hms">
      <label htmlFor="gen-agendas" className="hms-label">
        Selecionar agendas
      </label>
      <div ref={ref} className="hms-field" onClick={() => setOpen(true)}>
        <div className="hms-rail">
          <div className="hms-rail-track">
            {values.length === 0 ? (
              <span className="hms-placeholder">Selecione uma ou mais agendas</span>
            ) : (
              options
                .filter((o) => values.includes(o.id))
                .map((o) => (
                  <span key={o.id} className="hms-chip">
                    <span className="hms-chip-label">{o.label}</span>
                    <span
                      className="hms-chip-remove"
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remover ${o.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(o.id);
                      }}
                    >
                      <CloseCircleIcon className="w-3 h-3" />
                    </span>
                  </span>
                ))
            )}
          </div>
        </div>
        <div className="hms-actions">
          {values.length > 0 && (
            <span
              className="hms-clear"
              role="button"
              tabIndex={-1}
              title="Limpar tudo"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
            >
              <CloseCircleIcon className="w-4 h-4" />
            </span>
          )}
          <span className="hms-chevron" role="button" tabIndex={-1} aria-hidden="true">
            <CaretDownIcon className="w-4 h-4" />
          </span>
        </div>
        {open && (
          <div className="hselect-popover hms-popover" onClick={(e) => e.stopPropagation()}>
            <div className="hms-search">
              <SearchSolidIcon className="hms-search-icon w-4 h-4" />
              <input type="text" placeholder="Buscar..." className="hms-search-input" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
            </div>
            <ul className="hms-options" role="listbox" aria-multiselectable="true">
              {hits.length === 0 ? (
                <li className="hms-empty">
                  <span>Nenhuma opção disponível</span>
                </li>
              ) : (
                hits.map((o) => (
                  <li key={o.id}>
                    <button type="button" className="hselect-option" role="option" aria-selected={values.includes(o.id)} onClick={() => toggle(o.id)}>
                      <span className="hselect-option-label">{o.label}</span>
                      {values.includes(o.id) && (
                        <span className="hselect-check">
                          <CheckReadIcon className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="hms-footer">
              <span className="hms-footer-count">{values.length} selecionados</span>
              <button type="button" className="hms-footer-done" onClick={() => setOpen(false)}>
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookingLinks() {
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState("");
  const [slugs, setSlugs] = useState<Record<string, string>>({});

  const generate = () => setGenerated(selected.length ? `${ALL_AGENDAS_LINK}?agendas=${selected.join(",")}` : "");

  return (
    <div id="link-agendamento-page" className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="hui-card">
          <div className="flex items-start gap-3">
            <span className="text-[color:var(--color-primary)] flex-shrink-0">
              <LinkIcon className="w-7 h-7" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 nunito-bold truncate">Link Principal</h2>
              <p className="text-xs text-gray-500 inter-regular">Página inicial de agendamento</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 inter-regular">
            Link geral da sua página de agendamentos. Ideal para bio, redes sociais e atendimento rápido.
          </p>
          <LinkField url={MAIN_LINK} />
        </div>

        <div className="hui-card">
          <div className="flex items-start gap-3">
            <span className="text-[color:var(--color-primary)] flex-shrink-0">
              <StarsIcon className="w-7 h-7" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 nunito-bold truncate">Gerador Personalizado</h2>
              <p className="text-xs text-gray-500 inter-regular">Crie links segmentados por agenda</p>
            </div>
          </div>
          <AgendaSelect values={selected} onChange={setSelected} />
          <div className="flex flex-col sm:flex-row gap-2">
            <input id="generated-link" type="text" readOnly placeholder="Link será gerado aqui" value={generated} className="hinput flex-1 min-w-0 inter-regular" />
            <button type="button" id="btn-generate-link" className="hbtn hbtn--primary" onClick={generate}>
              <StarsIcon className="w-4 h-4" />
              Gerar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              id="btn-copy-link"
              disabled={!generated}
              className="hbtn hbtn--secondary hbtn--sm"
              onClick={() => navigator.clipboard?.writeText(generated).catch(() => {})}
            >
              <WidgetIcon className="w-4 h-4" />
              Copiar
            </button>
            <button type="button" id="btn-share-whatsapp" disabled={!generated} className="hbtn hbtn--secondary hbtn--sm">
              <ChatIcon className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Links por agenda</h2>
            <p className="hwidget-desc">Compartilhe links diretos por agenda e por serviço.</p>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div className="mt-4">
          <div className="hui-card">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 lg:w-72 flex-shrink-0 min-w-0">
                <span className="text-[color:var(--color-primary)] flex-shrink-0">
                  <CalendarIcon className="w-7 h-7" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 nunito-bold">Todas as Agendas</h3>
                  <p className="text-xs text-gray-500 inter-regular mt-0.5">Link para todas as agendas ativas da organização.</p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <LinkField url={ALL_AGENDAS_LINK} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-3" id="agendasAccordion">
          {AGENDAS.map((a) => (
            <div key={a.id} id={`link-agenda-${a.id}`}>
              <div className="overflow-hidden hui-card hui-card--flush">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none select-none hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 nunito-bold truncate">{a.name}</h3>
                        {!slugs[a.id] && (
                          <span className="hchip hchip--warning hchip--soft hchip--sm">
                            <CloseCircleIcon className="w-3 h-3" /> Sem identificador
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 inter-regular mt-0.5">
                        Defina um identificador para gerar o link amigável desta agenda.
                      </p>
                    </div>
                    <CaretDownIcon className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-secondary)] p-4 space-y-4">
                    <form
                      className="space-y-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const value = new FormData(e.currentTarget).get("slug");
                        setSlugs({ ...slugs, [a.id]: String(value ?? "") });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        <h4 className="text-xs font-semibold text-gray-700 inter-semibold uppercase tracking-wide">Identificador da Agenda</h4>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="hslug-field">
                            <div className="hslug-group">
                              <span className="hslug-prefix" title={`eagenda.com.br/agenda/${ORG}/`}>
                                eagenda.com.br/agenda/{ORG}/
                              </span>
                              <input
                                id={`slug-agenda-${a.id}`}
                                className="hslug-input"
                                type="text"
                                name="slug"
                                defaultValue={slugs[a.id] ?? ""}
                                placeholder="agenda-exemplo"
                                pattern="[a-z0-9]+(?:[_\-][a-z0-9]+)*"
                                maxLength={250}
                                required
                                title="Use apenas letras minúsculas, números, hífens e underlines. Sem espaços ou caracteres especiais."
                              />
                            </div>
                            <p className="hinput-desc">
                              Use apenas letras minúsculas, números, hífens (-) e underlines (_). Espaços viram hífens.
                            </p>
                          </div>
                        </div>
                        <button type="submit" className="hbtn hbtn--primary">
                          <CheckReadIcon className="w-4 h-4" />
                          Salvar
                        </button>
                      </div>
                    </form>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
