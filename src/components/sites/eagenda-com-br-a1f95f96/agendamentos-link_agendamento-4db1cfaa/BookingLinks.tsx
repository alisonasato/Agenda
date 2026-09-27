"use client";

import { useState } from "react";
import {
  CalendarIcon,
  CaretDownIcon,
  CheckReadIcon,
  CloseCircleIcon,
  CopySolidIcon,
  ExternalLinkIcon,
  LinkIcon,
  QrIcon,
  StarsIcon,
  WhatsappIcon,
} from "../shared/icons";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { QrModal } from "./QrModal";
import { update, useData } from "@/lib/seiri/store";

// Mock organisation: the live page builds every link from the account's own slug.
const ORG = "minhaempresa";
const MAIN_LINK = `https://${ORG}.seiri.com.br`;
const ALL_AGENDAS_LINK = `https://seiri.com.br/agendamentos/incluir/${ORG}/horarios`;
const agendaLink = (slug: string) => `https://${ORG}.seiri.com.br/agenda/${ORG}/${slug}`;

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Opens WhatsApp with the link already in the message, like `data-share-whatsapp` does. */
const shareOnWhatsapp = (url: string) => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");

function LinkField({ url, onQr }: { url: string; onQr: (url: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="hlinkfield">
      <span className="hlinkfield-url" title={url}>
        {url}
      </span>
      <div className="hlinkfield-actions">
        <button
          type="button"
          title={copied ? "Link copiado" : "Copiar link"}
          aria-label="Copiar link"
          className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
          onClick={copy}
        >
          {copied ? <CheckReadIcon className="w-4 h-4" /> : <CopySolidIcon className="w-4 h-4" />}
        </button>
        <button
          type="button"
          title="Compartilhar no WhatsApp"
          aria-label="Compartilhar no WhatsApp"
          className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
          onClick={() => shareOnWhatsapp(url)}
        >
          <WhatsappIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Visualizar QR Code"
          aria-label="Visualizar QR Code"
          className="hbtn hbtn--ghost hbtn--sm hbtn--icon"
          onClick={() => onQr(url)}
        >
          <QrIcon className="w-4 h-4" />
        </button>
        <a href={url} title="Abrir link" aria-label="Abrir link" target="_blank" rel="noopener noreferrer" className="hbtn hbtn--ghost hbtn--sm hbtn--icon">
          <ExternalLinkIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export function BookingLinks() {
  const data = useData();
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const agendas = data.agendas.filter((a) => a.active);
  // Agendas without a custom slug are flagged, like the live picker does.
  const options = agendas.map((a) => ({ id: a.id, label: a.slug ? a.name : `${a.name} (sem identificador)` }));

  const generate = () => setGenerated(selected.length ? `${ALL_AGENDAS_LINK}?agendas=${selected.join(",")}` : "");
  const copyGenerated = () => {
    navigator.clipboard?.writeText(generated).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const saveSlug = (id: string, value: string) => update((d) => ({ ...d, agendas: d.agendas.map((a) => (a.id === id ? { ...a, slug: slugify(value) } : a)) }));

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
          <p className="text-sm text-gray-600 inter-regular">Link geral da sua página de agendamentos. Ideal para bio, redes sociais e atendimento rápido.</p>
          <LinkField url={MAIN_LINK} onQr={setQr} />
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
          <ChipMultiSelect
            id="gen-agendas"
            label="Selecionar agendas"
            placeholder="Selecione uma ou mais agendas"
            options={options}
            values={selected}
            onChange={setSelected}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="generated-link"
              type="text"
              readOnly
              placeholder="Link será gerado aqui"
              value={generated}
              className="hinput flex-1 min-w-0 inter-regular"
            />
            <button type="button" id="btn-generate-link" className="hbtn hbtn--primary" onClick={generate}>
              <StarsIcon className="w-4 h-4" />
              Gerar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" id="btn-copy-link" disabled={!generated} className="hbtn hbtn--secondary hbtn--sm" onClick={copyGenerated}>
              {copied ? <CheckReadIcon className="w-4 h-4" /> : <CopySolidIcon className="w-4 h-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button
              type="button"
              id="btn-share-whatsapp"
              disabled={!generated}
              className="hbtn hbtn--secondary hbtn--sm"
              onClick={() => shareOnWhatsapp(generated)}
            >
              <WhatsappIcon className="w-4 h-4" />
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
                <LinkField url={ALL_AGENDAS_LINK} onQr={setQr} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-3" id="agendasAccordion">
          {agendas.map((a) => (
            <div key={a.id} id={`link-agenda-${a.id}`}>
              <div className="overflow-hidden hui-card hui-card--flush">
                <details className="group">
                  <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none select-none hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 nunito-bold truncate">{a.name}</h3>
                        {!a.slug && (
                          <span className="hchip hchip--warning hchip--soft hchip--sm">
                            <CloseCircleIcon className="w-3 h-3" /> Sem identificador
                          </span>
                        )}
                      </div>
                      {!a.slug && (
                        <p className="text-xs text-gray-500 inter-regular mt-0.5">Defina um identificador para gerar o link amigável desta agenda.</p>
                      )}
                    </div>
                    <CaretDownIcon className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-secondary)] p-4 space-y-4">
                    {/* With an identifier the original only shows the link; without one it asks for the identifier. */}
                    {a.slug ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          <h4 className="text-xs font-semibold text-gray-700 inter-semibold uppercase tracking-wide">Link da Agenda</h4>
                        </div>
                        <LinkField url={agendaLink(a.slug)} onQr={setQr} />
                      </div>
                    ) : (
                      <form
                        className="space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveSlug(a.id, String(new FormData(e.currentTarget).get("slug") ?? ""));
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
                                <span className="hslug-prefix" title={`seiri.com.br/agenda/${ORG}/`}>
                                  seiri.com.br/agenda/{ORG}/
                                </span>
                                <input
                                  id={`slug-agenda-${a.id}`}
                                  className="hslug-input"
                                  type="text"
                                  name="slug"
                                  placeholder="agenda-exemplo"
                                  pattern="[a-z0-9]+(?:[_\-][a-z0-9]+)*"
                                  maxLength={250}
                                  required
                                  onInput={(e) => (e.currentTarget.value = slugify(e.currentTarget.value))}
                                  title="Use apenas letras minúsculas, números, hífens e underlines. Sem espaços ou caracteres especiais."
                                />
                              </div>
                              <p className="hinput-desc">Use apenas letras minúsculas, números, hífens (-) e underlines (_). Espaços viram hífens.</p>
                            </div>
                          </div>
                          <button type="submit" className="hbtn hbtn--primary">
                            <CheckReadIcon className="w-4 h-4" />
                            Salvar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>

      {qr && <QrModal url={qr} onClose={() => setQr("")} />}
    </div>
  );
}
