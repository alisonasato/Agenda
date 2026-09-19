"use client";

import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import {
  BuildingIcon,
  CalendarAddIcon,
  CalendarIcon,
  CaretDownIcon,
  ChartIcon,
  ChatIcon,
  ChecklistIcon,
  ClipboardIcon,
  CloseCircleIcon,
  CrownIcon,
  DashboardIcon,
  LinkIcon,
  QuestionCircleIcon,
  SearchOutlineIcon,
  StarsIcon,
  UsersIcon,
} from "./icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Only the cloned pages link somewhere; the rest of the menu is inert. */
export const ROUTES = {
  painel: "/",
  clientes: "/clientes/listar",
  acessoClientes: "/users/clientes_autorizados/listas_acesso",
  relatorioClientes: "/relatorios/clientes",
  relatorioConsolidado: "/relatorios/consolidado",
  relatorioAgendamentos: "/relatorios/agendamentos",
  relatorioIndicadores: "/relatorios/indicadores",
  formularios: "/pesquisas/controle",
  notificacoesRegras: "/notificacao/regras",
  notificacoesStatus: "/notificacao/regras_status",
  novaRegraStatus: "/notificacao/regras_status/nova",
  modelosEmail: "/notificacao/email_template",
  modelosWhatsapp: "/notificacao/whatsapp_template",
  acompanhamento: "/notificacao/envios",
  pacotesEnvio: "/users/pacotes/notificacoes",
  extrato: "/planos/transactions",
  planos: "/users/planos",
  integracoes: "/integracoes",
  calendario: "/agendamentos/calendar/18078",
  novoAgendamento: "/agendamentos/novo_agendamento",
  agendamentos: "/agendamentos/listar",
  configurarAgendas: "/agendamentos/configurar",
  linksAgendamento: "/agendamentos/link_agendamento",
  limitesAgendamentos: "/agendamentos/limites",
  listasBloqueio: "/agendamentos/limites/lista_bloqueios",
  recorrencias: "/agendamentos/recorrencias",
  confirmarAgendamentos: "/agendamentos/listar?status=PENDING&interval=all",
  feriados: "/agendamentos/feriados",
} as const;

/** `key` disambiguates labels that appear twice (e.g. "Agendamentos"); it defaults to the label. */
type Leaf = { label: string; key?: string; href?: string; keywords?: string };
type NavEntry =
  | { kind: "link"; label: string; icon: Icon; href?: string; keywords?: string }
  | { kind: "group"; label: string; icon: Icon; items: Leaf[] }
  | { kind: "divider" };

const NAV: NavEntry[] = [
  { kind: "link", label: "Painel", icon: DashboardIcon, href: ROUTES.painel },
  { kind: "link", label: "Calendário", icon: CalendarIcon, href: ROUTES.calendario, keywords: "Ver Minha Agenda Agenda" },
  { kind: "link", label: "Novo Agendamento", icon: CalendarAddIcon, href: ROUTES.novoAgendamento, keywords: "Incluir Agendamento Agenda" },
  { kind: "link", label: "Agendamentos", icon: ChecklistIcon, href: ROUTES.agendamentos, keywords: "Listar Agendamentos Agenda" },
  {
    kind: "group",
    label: "Gestão de Agendas",
    icon: CalendarIcon,
    items: [
      { label: "Configuração", href: ROUTES.configurarAgendas },
      { label: "Links de Agendamento", href: ROUTES.linksAgendamento },
      { label: "Limites de Agendamentos", href: ROUTES.limitesAgendamentos },
      { label: "Listas de Bloqueio", href: ROUTES.listasBloqueio, keywords: "Bloqueios de Datas Supressão" },
      { label: "Agendamentos Recorrentes", href: ROUTES.recorrencias, keywords: "Recorrências" },
      { label: "Confirmar Agendamentos", href: ROUTES.confirmarAgendamentos },
      { label: "Feriados", href: ROUTES.feriados },
    ],
  },
  { kind: "divider" },
  {
    kind: "group",
    label: "Clientes",
    icon: UsersIcon,
    items: [{ label: "Listar Clientes", href: ROUTES.clientes, keywords: "Buscar" }, { label: "Acesso de Clientes", href: ROUTES.acessoClientes }],
  },
  {
    kind: "group",
    label: "Relatórios",
    icon: ChartIcon,
    items: [
      { label: "Clientes", href: ROUTES.relatorioClientes },
      { label: "Consolidado", href: ROUTES.relatorioConsolidado },
      { label: "Agendamentos", key: "relatorioAgendamentos", href: ROUTES.relatorioAgendamentos },
      { label: "Indicadores Gerenciais", href: ROUTES.relatorioIndicadores },
    ],
  },
  { kind: "link", label: "Formulários", icon: ClipboardIcon, href: ROUTES.formularios, keywords: "Gerenciar Formulários" },
  {
    kind: "group",
    label: "Comunicação",
    icon: ChatIcon,
    items: [
      { label: "Regras de Notificação", href: ROUTES.notificacoesRegras },
      { label: "Notificações por Status", href: ROUTES.notificacoesStatus },
      { label: "Modelos de Email", href: ROUTES.modelosEmail },
      { label: "Acompanhamento", href: ROUTES.acompanhamento },
      { label: "Pacotes de Envio", href: ROUTES.pacotesEnvio, keywords: "Pacotes de Notificações" },
    ],
  },
  { kind: "divider" },
  { kind: "link", label: "Integrações", icon: LinkIcon, href: ROUTES.integracoes },
  {
    kind: "group",
    label: "Conta",
    icon: BuildingIcon,
    items: [
      { label: "Tela de Agendamento" },
      { label: "Dados da Conta", keywords: "Configurações Gerais Dados da Organização" },
      { label: "Administrar Agendas", keywords: "Horários e Datas Painel de Controle" },
      { label: "Administrar Equipe" },
      { label: "Administrar Unidades" },
      { label: "Administrar Contas" },
    ],
  },
  {
    kind: "group",
    label: "Ajuda",
    icon: QuestionCircleIcon,
    items: [
      { label: "Passo a Passo" },
      { label: "Suporte via WhatsApp" },
      { label: "Tutoriais" },
      { label: "Vídeos no YouTube" },
      { label: "Desenvolvimento" },
      { label: "Aplicativo" },
      { label: "Autorizar Suporte" },
    ],
  },
];

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

type SearchHit = { label: string; group?: string; icon: Icon; href?: string; keys: string };
const SEARCH_INDEX: SearchHit[] = NAV.flatMap((e): SearchHit[] => {
  if (e.kind === "link") return [{ label: e.label, icon: e.icon, href: e.href, keys: norm(`${e.label} ${e.keywords ?? ""}`) }];
  if (e.kind === "group")
    return e.items.map((i) => ({ label: i.label, group: e.label, icon: e.icon, href: i.href, keys: norm(`${i.label} ${e.label} ${i.keywords ?? ""}`) }));
  return [];
});

type SidebarProps = {
  /** Label (or `key`) of the nav entry marked as the current page. */
  active: string;
  /** Calendar mode: icon rail that expands while hovered. */
  peek?: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ active, peek = false, mobileOpen, onCloseMobile }: SidebarProps) {
  const [peekOpen, setPeekOpen] = useState(false);
  // A group holding the current page starts open, like the original.
  const activeGroup =
    NAV.find((e) => e.kind === "group" && e.items.some((i) => (i.key ?? i.label) === active))?.kind === "group"
      ? (NAV.find((e) => e.kind === "group" && e.items.some((i) => (i.key ?? i.label) === active)) as { label: string }).label
      : null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl + K focuses the page search, like the original.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = norm(query.trim());
  const hits = q ? SEARCH_INDEX.filter((h) => h.keys.includes(q)) : [];

  return (
    <aside
      id="sidebar"
      className={`sidebar hui-enter fixed top-0 left-0 w-[288px] h-screen flex flex-col z-[60] border-r border-slate-200${mobileOpen ? " mobile-open" : ""}${peek && peekOpen ? " is-peek-open" : ""}`}
      onMouseEnter={peek ? () => setPeekOpen(true) : undefined}
      onMouseLeave={peek ? () => setPeekOpen(false) : undefined}
    >
      <div id="logoContainer" className="sidebar-header flex items-center justify-between h-16 shrink-0 px-6">
        <a href={ROUTES.painel} className="sidebar-brand flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="Seiri"
            className="sidebar-logo sidebar-logo--light h-[1.875rem] w-auto select-none"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-minimal.png"
            alt=""
            aria-hidden="true"
            className="cal-peek-logo hidden h-8 w-8 select-none"
            draggable={false}
          />
        </a>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          aria-label="Fechar menu"
        >
          <CloseCircleIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="shrink-0 px-5 pt-8" data-sidebar-search-wrap>
        <label className={`hui-search hui-search--pill${query ? " has-query" : ""}`}>
          <SearchOutlineIcon className="hui-search-icon w-[18px] h-[18px]" />
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            className="hui-search-input"
            placeholder="Buscar páginas..."
            aria-label="Buscar páginas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          />
          <kbd className="hui-search-kbd" aria-hidden="true">Ctrl + K</kbd>
          <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
            <CloseCircleIcon className="w-4 h-4" />
          </button>
        </label>
        <div className="cal-peek-search hidden" aria-hidden="true">
          <SearchOutlineIcon className="w-[18px] h-[18px]" />
        </div>
      </div>

      <nav className="sidebar-scroll-fade scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-2 px-5 pt-5" role="navigation" aria-label="Sidebar">
        {q ? (
          hits.length ? (
            <div className="space-y-1">
              {hits.map((h) => (
                <a key={`${h.group ?? ""}-${h.label}`} href={h.href ?? "#"} className="snav-row nav-item nav-item-idle">
                  <h.icon className="sidebar-icon w-[18px] h-[18px]" />
                  <span className="snav-label sidebar-text font-medium">
                    {h.label}
                    {h.group && <span className="text-xs text-slate-400"> · {h.group}</span>}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">Nenhuma página encontrada.</p>
          )
        ) : (
          <div className="space-y-1.5">
            {NAV.map((entry, i) => {
              if (entry.kind === "divider") return <hr key={i} className="sidebar-zone-divider" aria-hidden="true" />;
              if (entry.kind === "link") {
                return (
                  <a
                    key={entry.label}
                    href={entry.href ?? "#"}
                    className={`snav-row nav-item ${entry.label === active ? "nav-item-active" : "nav-item-idle"}`}
                    aria-current={entry.label === active ? "page" : undefined}
                  >
                    <entry.icon className="sidebar-icon w-[18px] h-[18px]" />
                    <span className="snav-label sidebar-text font-medium">{entry.label}</span>
                  </a>
                );
              }
              const open = openGroup === entry.label;
              return (
                  <div key={entry.label} className={`sidebar-group${open ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className={`snav-row sidebar-section-toggle ${entry.label === activeGroup ? "sidebar-group-active" : "nav-item-idle"}`}
                      aria-expanded={open}
                      onClick={() => setOpenGroup(open ? null : entry.label)}
                    >
                      <span className="sidebar-group-icon inline-flex shrink-0">
                        <entry.icon className="sidebar-icon w-[18px] h-[18px]" />
                      </span>
                      <span className="snav-label sidebar-text">{entry.label}</span>
                      <CaretDownIcon className="sidebar-chevron w-4 h-4 shrink-0" />
                    </button>
                    <div className="sidebar-group-content">
                      <div className="sidebar-group-inner">
                        <ul className="sidebar-sublist space-y-0.5">
                          {entry.items.map((item) => (
                            <li key={item.label}>
                              <a
                                href={item.href ?? "#"}
                                className={`snav-sub sidebar-text${(item.key ?? item.label) === active ? " nav-item-active" : ""}`}
                                aria-current={(item.key ?? item.label) === active ? "page" : undefined}
                                tabIndex={open ? 0 : -1}
                              >
                                {item.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>
        )}
      </nav>

      <div className="sidebar-footer shrink-0 px-5 pt-1 pb-6">
        <div className="sidebar-plan-card sidebar-plan-card--upgrade hui-enter" style={{ "--hui-enter-delay": "80ms" } as CSSProperties}>
          <div className="sidebar-plan-head">
            <span className="sidebar-plan-crown" aria-hidden="true">
              <CrownIcon />
            </span>
            <span className="sidebar-plan-name">Plano Teste</span>
            <span className="hchip hchip--success hchip--primary hchip--sm">Ativo</span>
          </div>
          <div className="sidebar-plan-cta-wrap">
            <div className="sidebar-plan-cta-inner">
              <a href="#" className="sidebar-plan-cta" title="Fazer upgrade">
                <StarsIcon className="w-4 h-4 shrink-0 sidebar-plan-cta-spark" />
                <span className="truncate">Fazer upgrade</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
