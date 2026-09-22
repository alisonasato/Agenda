"use client";

import { withBase } from "@/lib/basePath";
import { useState, type CSSProperties } from "react";
import {
  BookIcon,
  ChatBubbleIcon,
  ChatIcon,
  CloseCircleIcon,
  ConnectIcon,
  InfoIcon,
  PlugCircleIcon,
  SearchEmptyIcon,
  SearchSolidIcon,
  UsersDuoIcon,
  UsersIcon,
} from "../shared/icons";

const ASSETS = withBase("/sites/eagenda-com-br-a1f95f96/integracoes-526c97c5");

type Integration = {
  name: string;
  /** Logo file in ASSETS; WideChat has none and shows a chat icon instead. */
  logo?: string;
  desc: string;
  keywords: string;
  action: "Conectar" | "Configurar";
  needsPlan?: boolean;
};

// None is connected on the live account. The detail pages behind the buttons aren't cloned yet.
const INTEGRATIONS: Integration[] = [
  { name: "Google Calendar", logo: "google-calendar", desc: "Sincronize seus agendamentos com o Google Calendar", keywords: "google calendar calendario sincronizar meet", action: "Conectar" },
  { name: "Microsoft Outlook/Teams", logo: "microsoft-teams", desc: "Integre com Outlook e Teams para agenda e reuniões", keywords: "microsoft teams outlook skype reuniao video calendario", action: "Conectar" },
  { name: "Zoom", logo: "zoom", desc: "Videoconferências via Zoom para reuniões online", keywords: "zoom video videoconferencia reuniao", action: "Conectar" },
  { name: "Atendimento Presencial", logo: "siga", desc: "Totem/senha para atendimentos presenciais", keywords: "atendimento presencial totem senha fila", action: "Conectar" },
  { name: "RD Station", logo: "rd-station", desc: "Integração com RD Station Marketing e CRM", keywords: "rd station marketing crm leads", action: "Conectar" },
  { name: "WideChat", desc: "Envie as notificações de WhatsApp pela sua conta WideChat", keywords: "widechat whatsapp mensagem notificacao canal chat", action: "Configurar" },
  { name: "Mercado Pago", logo: "mercado-pago", desc: "Cobrar pelo agendamento com Mercado Pago", keywords: "mercado pago pagamento cobranca cartao pix", action: "Conectar" },
  { name: "Sites (Embed)", logo: "embed", desc: "Incorpore o agendamento em seu site ou aplicativo", keywords: "sites embed incorporar widget iframe", action: "Configurar" },
  { name: "Emails", logo: "email", desc: "Envie emails de notificação usando seu próprio domínio", keywords: "emails email envio dominio personalizado", action: "Configurar", needsPlan: true },
  { name: "API & Webhooks", logo: "api-webhooks", desc: "Integração via API REST e eventos em tempo real", keywords: "api rest webhook eventos tempo real desenvolvedor token", action: "Configurar" },
];

const TABS = [
  { id: "integracoes", label: "Integrações", Icon: PlugCircleIcon },
  { id: "equipe", label: "Integrações da Equipe", Icon: UsersIcon },
] as const;
type Tab = (typeof TABS)[number]["id"];

// Accent-insensitive, like the original's norm().
const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const TEAM_SLOTS = 10;

/** "Integrações da Equipe": the members' integrations. Only the owner (mock) on this account. */
function TeamTable() {
  return (
    <div className="htable">
      <div className="htable-scroll">
        <table className="htable-table htable-fixed">
          <thead>
            <tr>
              <th className="htable-col">Membro</th>
              <th className="htable-col">Cargo</th>
              <th className="htable-col">Integrações</th>
              <th className="htable-col htable-col--num">Agendas</th>
              <th className="htable-col htable-col--end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="htable-cell">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 inter-semibold truncate">Maria Souza</p>
                  <p className="text-xs text-gray-500 inter-regular truncate">contato@exemplo.com.br</p>
                </div>
              </td>
              <td className="htable-cell">
                <div className="flex flex-wrap gap-1.5">
                  <span className="hchip hchip--accent hchip--primary hchip--sm">Proprietário</span>
                </div>
              </td>
              <td className="htable-cell">
                <span className="text-sm text-gray-400 inter-regular">—</span>
              </td>
              <td className="htable-cell htable-cell--num">
                <span className="text-sm text-gray-900 inter-semibold">0</span>
              </td>
              <td className="htable-cell htable-cell--end">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-sm text-gray-400 inter-regular">—</span>
                </div>
              </td>
            </tr>
            {Array.from({ length: TEAM_SLOTS - 1 }, (_, i) => (
              <tr key={i} className="htable-row--empty" aria-hidden="true">
                {Array.from({ length: 5 }, (_, j) => (
                  <td key={j} className="htable-cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="htable-empty" hidden role="status" aria-live="polite">
        <div className="hempty hempty--inline hui-reveal">
          <UsersDuoIcon className="hempty-icon" />
          <h3 className="hempty-title nunito-bold">Nenhum membro na equipe</h3>
          <p className="hempty-desc inter-regular">Convide membros para a organização e as integrações de cada um aparecerão aqui.</p>
        </div>
      </div>
      <div className="htable-footer">
        <div className="htable-pagination" hidden />
      </div>
    </div>
  );
}

export function Integrations() {
  const [tab, setTab] = useState<Tab>("integracoes");
  const [search, setSearch] = useState("");
  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const match = (k: string) => !search || norm(k).includes(norm(search));
  const visibleCount = INTEGRATIONS.filter((i) => match(i.keywords)).length;
  // Both panels stay mounted and toggle with display:none (x-show in the original).
  const shown = (visible: boolean): CSSProperties | undefined => (visible ? undefined : { display: "none" });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 hui-reveal">
        <div className="flex-shrink-0 min-w-0">
          <div className="htabs" role="tablist" aria-label="Seções da página" style={{ "--htabs-count": TABS.length } as CSSProperties}>
            <span className="htabs-indicator" aria-hidden="true" style={{ transform: `translateX(calc(${tabIndex} * 100%))` }} />
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} type="button" className={`htabs-tab${id === tab ? " is-active" : ""}`} role="tab" aria-selected={id === tab} onClick={() => setTab(id)}>
                <span className="htabs-tab-icon">
                  <Icon className="w-4 h-4" />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full sm:w-80 sm:min-w-[14rem] min-w-0 sm:ml-auto" style={shown(tab === "integracoes")}>
          <label className={`hui-search w-full${search ? " has-query" : ""}`}>
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar integrações..."
              aria-label="Buscar integrações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setSearch("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
        </div>
      </div>

      <div style={shown(tab === "integracoes")}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mt-6">
          {INTEGRATIONS.map((i) => (
            <div key={i.name} className="w-full min-w-0 h-full" style={shown(match(i.keywords))}>
              <div className="h-full overflow-hidden hui-card hui-card--flush">
                <div className="flex flex-col h-full p-4 md:p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    {i.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small static SVG logos, as in the original
                      <img src={`${ASSETS}/${i.logo}.svg`} alt="" className="w-8 h-8 flex-shrink-0" />
                    ) : (
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500">
                        <ChatBubbleIcon className="w-[18px] h-[18px]" />
                      </span>
                    )}
                    <h3 className="text-base md:text-lg text-gray-900 nunito-bold leading-tight break-words min-w-0">{i.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="hchip hchip--default hchip--soft hchip--sm">
                      <CloseCircleIcon className="w-4 h-4" /> Não conectado
                    </span>
                    {i.needsPlan && <span className="hchip hchip--warning hchip--soft hchip--sm">Requer plano</span>}
                  </div>
                  <p className="text-sm text-gray-500 inter-regular mt-3 mb-4">{i.desc}</p>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <a href="#" className="hbtn hbtn--primary hbtn--sm">
                      <ConnectIcon />
                      {i.action}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8" style={shown(!!search && visibleCount === 0)}>
          <div className="flex flex-col items-center justify-center text-center py-12">
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mb-3">
              <SearchEmptyIcon className="w-6 h-6" />
            </span>
            <h3 className="text-base font-bold text-gray-900 nunito-bold mb-1">Nenhuma integração encontrada</h3>
            <p className="text-sm text-gray-500 inter-regular mb-4">Tente buscar por outro termo</p>
            <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setSearch("")}>
              Limpar busca
            </button>
          </div>
        </div>

        <div className="mt-8 hui-reveal">
          <div className="halert halert--accent" role="alert">
            <span className="halert-indicator">
              <InfoIcon className="w-[18px] h-[18px]" />
            </span>
            <div className="halert-content">
              <p className="halert-description">Consulte a documentação para configurar cada integração ou fale com o suporte.</p>
            </div>
            <div className="halert-actions">
              {/* The original points at eAgenda's docs and contact pages; Seiri has none yet. */}
              <a href="#" className="hbtn hbtn--secondary hbtn--sm">
                <BookIcon />
                Documentação
              </a>
              <a href="#" className="hbtn hbtn--secondary hbtn--sm">
                <ChatIcon />
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 hui-reveal" style={shown(tab === "equipe")}>
        <div id="team-integrations-table">
          <TeamTable />
        </div>
      </div>
    </>
  );
}
