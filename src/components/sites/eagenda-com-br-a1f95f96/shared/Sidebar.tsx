"use client";

import { withBase } from "@/lib/basePath";
import { Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ComponentType, type CSSProperties, type SVGProps } from "react";
import {
  BuildingIcon,
  CalendarAddIcon,
  CalendarIcon,
  CaretDownIcon,
  CaretUpIcon,
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
const PATHS = {
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
  telaAgendamento: "/users/tela_agendamento",
  dadosConta: "/users/organization/business",
  adminAgendas: "/painel/controle",
  adminEquipe: "/users/adm_equipe",
  adminUnidades: "/users/unidades_atendimento",
  adminContas: "/users/organizacao/contas",
  novaConta: "/users/organizacao/contas/nova",
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
  passoAPasso: "/onboarding",
} as const;
/** Hrefs for plain <a> links, so they carry the base path (GitHub Pages serves the app under one). */
export const ROUTES = Object.fromEntries(Object.entries(PATHS).map(([k, v]) => [k, withBase(v)])) as { [K in keyof typeof PATHS]: string };

type Mode = "simple" | "full";
/**
 * Hidden entries stay in the page search, like the original's `hidden` leaves:
 * - "always": search-only;
 * - "simple": hidden in the simplified menu, unless it is the current page;
 * - "simple-strict": hidden in the simplified menu even when current (another entry lights up).
 */
type Hide = "always" | "simple" | "simple-strict";

/** `key` is what pages pass as `active` (it defaults to the label; renamed items keep their old key). */
type Leaf = { label: string; key?: string; href?: string; keywords?: string; hide?: Hide; mode?: Mode; noSearch?: boolean };
type LinkEntry = {
  kind: "link";
  label: string;
  key?: string;
  icon: Icon;
  href?: string;
  keywords?: string;
  hide?: Hide;
  mode?: Mode;
  /** Not in the page search (the original gives it no data-leaf). */
  noSearch?: boolean;
  /** Other keys that light this link up (the simplified menu's stand-in for a hidden group). */
  activeFor?: string[];
};
type GroupEntry = {
  kind: "group";
  label: string;
  icon: Icon;
  items: Leaf[];
  hide?: Hide;
  mode?: Mode;
  /** Search-only group (no toggle), holding leaves the menu doesn't show. */
  searchOnly?: boolean;
  /** A `mode: "full"` group shown in the simplified menu when it holds the current page, replacing `replaces`. */
  replaces?: string;
};
type NavEntry = LinkEntry | GroupEntry | { kind: "divider" };

const COMUNICACAO = ["Regras de Notificação", "Notificações por Status", "Modelos de Email", "Acompanhamento", "Pacotes de Envio"];

/** The original's current sidebar: a simplified menu by default, "Mostrar todas as opções" for the full one. */
const NAV: NavEntry[] = [
  { kind: "link", label: "Painel", icon: DashboardIcon, href: ROUTES.painel },
  { kind: "link", label: "Calendário", icon: CalendarIcon, href: ROUTES.calendario, keywords: "Ver Minha Agenda Agenda" },
  { kind: "link", label: "Novo Agendamento", icon: CalendarAddIcon, href: ROUTES.novoAgendamento, keywords: "Incluir Agendamento Agenda" },
  { kind: "link", label: "Agendamentos", icon: ChecklistIcon, href: ROUTES.agendamentos, keywords: "Listar Agendamentos Agenda" },
  {
    kind: "group",
    label: "Minha Agenda",
    icon: CalendarIcon,
    items: [
      { label: "Configuração", href: ROUTES.configurarAgendas },
      { label: "Links de Agendamento", href: ROUTES.linksAgendamento },
      { label: "Limites de Agendamentos", href: ROUTES.limitesAgendamentos, hide: "simple" },
      { label: "Serviços", keywords: "Subserviços Procedimentos", hide: "always" },
      { label: "Tags", keywords: "Etiquetas Marcadores", hide: "always" },
      { label: "Listas de Bloqueio", href: ROUTES.listasBloqueio, keywords: "Bloqueios de Datas Supressão", hide: "simple" },
      { label: "Lista de Espera", keywords: "Fila de Espera", hide: "always" },
      { label: "Agendamentos Recorrentes", href: ROUTES.recorrencias, keywords: "Recorrências" },
      { label: "Confirmar Agendamentos", href: ROUTES.confirmarAgendamentos, hide: "simple" },
      { label: "Feriados", href: ROUTES.feriados },
    ],
  },
  { kind: "divider" },
  // Clientes: a plain link in the simplified menu, a group in the full one.
  {
    kind: "link",
    label: "Clientes",
    key: "Listar Clientes",
    icon: UsersIcon,
    href: ROUTES.clientes,
    keywords: "Listar Clientes Clientes Buscar",
    mode: "simple",
  },
  {
    kind: "group",
    label: "Clientes",
    icon: UsersIcon,
    searchOnly: true,
    mode: "simple",
    items: [
      { label: "Acesso de Clientes", href: ROUTES.acessoClientes, keywords: "Clientes" },
      { label: "Importar Clientes", key: "importarClientes", href: ROUTES.clientes, keywords: "Importação CSV Planilha Excel Clientes" },
    ],
  },
  {
    kind: "group",
    label: "Clientes",
    icon: UsersIcon,
    mode: "full",
    replaces: "Clientes",
    items: [
      { label: "Listar Clientes", href: ROUTES.clientes, keywords: "Buscar Clientes" },
      { label: "Acesso de Clientes", href: ROUTES.acessoClientes, keywords: "Clientes" },
      { label: "Importar Clientes", key: "importarClientes", href: ROUTES.clientes, keywords: "Importação CSV Planilha Excel Clientes", hide: "always" },
    ],
  },
  {
    kind: "group",
    label: "Relatórios",
    icon: ChartIcon,
    items: [
      { label: "Clientes", href: ROUTES.relatorioClientes, keywords: "Clientes" },
      { label: "Consolidado", href: ROUTES.relatorioConsolidado },
      { label: "Agendamentos", key: "relatorioAgendamentos", href: ROUTES.relatorioAgendamentos },
      { label: "Indicadores Gerenciais", href: ROUTES.relatorioIndicadores },
    ],
  },
  { kind: "link", label: "Formulários", icon: ClipboardIcon, href: ROUTES.formularios, keywords: "Gerenciar Formulários", hide: "simple" },
  {
    kind: "group",
    label: "Comunicação",
    icon: ChatIcon,
    hide: "simple-strict",
    items: [
      { label: "Regras de Notificação", href: ROUTES.notificacoesRegras },
      { label: "Notificações por Status", href: ROUTES.notificacoesStatus },
      { label: "Modelos de Email", href: ROUTES.modelosEmail },
      { label: "Acompanhamento", href: ROUTES.acompanhamento },
      { label: "Pacotes de Envio", href: ROUTES.pacotesEnvio, keywords: "Pacotes de Notificações" },
    ],
  },
  {
    kind: "link",
    label: "Regras de Notificação",
    key: "simpleRegras",
    icon: ChatIcon,
    href: ROUTES.notificacoesRegras,
    mode: "simple",
    noSearch: true,
    activeFor: COMUNICACAO,
  },
  { kind: "divider" },
  { kind: "link", label: "Integrações", icon: LinkIcon, href: ROUTES.integracoes, hide: "simple-strict" },
  {
    kind: "group",
    label: "Integrações",
    icon: LinkIcon,
    searchOnly: true,
    items: [
      "Atendimento Presencial",
      "Google Calendar",
      "Zoom",
      "Microsoft Teams/Skype",
      "Sites",
      "Emails",
      "RD Station",
      "Mercado Pago",
      "API",
      "Webhook",
    ].map((label) => ({ label, key: `integracao:${label}` })),
  },
  {
    kind: "group",
    label: "Conta",
    icon: BuildingIcon,
    items: [
      { label: "Tela de Agendamento", href: ROUTES.telaAgendamento },
      {
        label: "Configurações Gerais",
        key: "Dados da Conta",
        href: ROUTES.dadosConta,
        keywords: "Configurações Gerais Dados da Organização Dados da Conta Segmento do Negócio",
      },
      { label: "Integrações", href: ROUTES.integracoes, mode: "simple", noSearch: true },
      { label: "Administrar Agendas", href: ROUTES.adminAgendas, keywords: "Horários e Datas Painel de Controle", hide: "simple" },
      { label: "Convidar equipe", key: "Administrar Equipe", href: ROUTES.adminEquipe, keywords: "Administrar Equipe Usuários" },
      { label: "Administrar Unidades", href: ROUTES.adminUnidades, hide: "simple" },
      { label: "Administrar Contas", href: ROUTES.adminContas, hide: "simple" },
      { label: "Planos", href: ROUTES.planos, hide: "always" },
    ],
  },
  {
    kind: "group",
    label: "Ajuda",
    icon: QuestionCircleIcon,
    items: [
      { label: "Passo a Passo", href: ROUTES.passoAPasso },
      { label: "Suporte via WhatsApp" },
      { label: "Tutoriais" },
      { label: "Vídeos no YouTube", hide: "simple" },
      { label: "Aplicativo" },
      { label: "Autorizar Suporte" },
    ],
  },
];

const keyOf = (e: { label: string; key?: string }) => e.key ?? e.label;
const holdsActive = (g: GroupEntry, active: string) => g.items.some((i) => keyOf(i) === active);

/** The entries of the menu in `mode`, with the swaps the original makes for the current page. */
function entriesFor(mode: Mode, active: string): NavEntry[] {
  // A full-menu group holding the current page also shows in the simplified menu (Acesso de Clientes).
  const promoted = new Set(
    NAV.filter(
      (e): e is GroupEntry =>
        e.kind === "group" &&
        e.mode === "full" &&
        !!e.replaces &&
        holdsActive(e, active) &&
        // …unless the simplified link itself is the current page (Listar Clientes).
        !NAV.some((l) => l.kind === "link" && l.mode === "simple" && l.label === e.replaces && keyOf(l) === active),
    ).map((e) => e.replaces),
  );
  return NAV.filter((e) => {
    if (e.kind === "divider") return true;
    if (e.kind === "group" && e.mode === "full" && mode === "simple") return promoted.has(e.replaces);
    if (e.mode && e.mode !== mode) return false;
    if (mode === "simple" && e.mode === "simple" && promoted.has(e.label)) return false;
    return true;
  }).map((e) => (e.kind === "group" ? { ...e, items: e.items.filter((i) => !i.mode || i.mode === mode) } : e));
}

const isHidden = (hide: Hide | undefined, mode: Mode, current: boolean) =>
  hide === "always" || (mode === "simple" && (hide === "simple-strict" || (hide === "simple" && !current)));

// The original folds case and accents ("calendario" finds "Calendário").
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

type SearchHit = { label: string; group?: string; icon: Icon; href?: string; search: string; labelFold: string };
function searchIndex(entries: NavEntry[]): SearchHit[] {
  return entries.flatMap((e): SearchHit[] => {
    if (e.kind === "link")
      return e.noSearch ? [] : [{ label: e.label, icon: e.icon, href: e.href, search: fold(`${e.label}  ${e.keywords ?? ""}`), labelFold: fold(e.label) }];
    if (e.kind === "group")
      return e.items
        .filter((i) => !i.noSearch)
        .map((i) => ({
          label: i.label,
          group: e.label,
          icon: e.icon,
          href: i.href,
          search: fold(`${i.label} ${e.label} ${i.keywords ?? ""}`),
          labelFold: fold(i.label),
        }));
    return [];
  });
}

/** Every term must match; ranked label-starts-with < label-contains-all < group/alias match, then menu order. */
function searchHits(index: SearchHit[], query: string) {
  const terms = fold(query.trim()).split(/\s+/).filter(Boolean);
  return index
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => terms.every((t) => p.search.includes(t)))
    .map(({ p, i }) => ({ p, i, rank: p.labelFold.startsWith(terms[0]) ? 0 : terms.every((t) => p.labelFold.includes(t)) ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map(({ p }) => p);
}

// "Mostrar todas as opções": a browser preference kept in the original's cookie.
const COOKIE = "eag_sidebar_full";
const modeListeners = new Set<() => void>();
const readMode = (): Mode => (document.cookie.split("; ").includes(`${COOKIE}=1`) ? "full" : "simple");
function toggleMode() {
  document.cookie = readMode() === "simple" ? `${COOKIE}=1; path=/; max-age=31536000; SameSite=Lax` : `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  modeListeners.forEach((l) => l());
}
const subscribeMode = (l: () => void) => {
  modeListeners.add(l);
  return () => modeListeners.delete(l);
};

const BAR_H = 16;

/**
 * A collapsible group. Its sub-list carries the original's two markers: a bar that slides to the
 * hovered sub-item (and rests on the current one), and an "L" tree line from the top of the list
 * to the current item.
 */
function Group({ entry, mode, active, open, onToggle }: { entry: GroupEntry; mode: Mode; active: string; open: boolean; onToggle: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const treeRef = useRef<HTMLSpanElement>(null);
  const isActiveGroup = holdsActive(entry, active);

  const moveBar = (el: HTMLElement | null) => {
    const bar = barRef.current;
    if (!bar) return;
    if (!el) return void (bar.style.opacity = "0");
    bar.style.transform = `translateY(${el.offsetTop + el.offsetHeight / 2 - BAR_H / 2}px)`;
    bar.style.opacity = "1";
  };
  const current = () => wrapRef.current?.querySelector<HTMLElement>("a.snav-sub.nav-item-active") ?? null;

  // Measures only hold while the group is open, so they are taken on open (as the original does).
  useLayoutEffect(() => {
    const bar = barRef.current;
    const tree = treeRef.current;
    if (!open || !bar || !tree) return;
    const cur = current();
    // The bar is born on the current item; later moves (hover) slide.
    bar.style.transition = "none";
    moveBar(cur);
    void bar.getBoundingClientRect();
    bar.style.transition = "";
    tree.style.height = cur ? `${cur.offsetTop + cur.offsetHeight / 2 + 1}px` : "0px";
    tree.classList.toggle("is-on", !!cur);
  }, [open, active, mode]);

  return (
    <div className={`sidebar-group${open ? " is-open" : ""}`}>
      <button
        type="button"
        className={`snav-row sidebar-section-toggle ${isActiveGroup ? "sidebar-group-active" : "nav-item-idle"}`}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="sidebar-group-icon inline-flex shrink-0">
          <entry.icon className="sidebar-icon w-[18px] h-[18px]" />
        </span>
        <span className="snav-label sidebar-text">{entry.label}</span>
        <CaretDownIcon className="sidebar-chevron w-4 h-4 shrink-0" />
      </button>
      <div className="sidebar-group-content">
        <div ref={wrapRef} className="sidebar-group-inner" onMouseLeave={() => moveBar(current())}>
          <span ref={barRef} className="snav-indicator" aria-hidden="true" style={{ opacity: 0 }} />
          <span ref={treeRef} className="snav-tree" aria-hidden="true" style={{ height: 0 }} />
          <ul className="sidebar-sublist space-y-0.5">
            {entry.items.map((item) => {
              const isCurrent = keyOf(item) === active;
              return (
                <li key={keyOf(item)} className={isHidden(item.hide, mode, isCurrent) ? "hidden" : undefined}>
                  <a
                    href={item.href ?? "#"}
                    className={`snav-sub sidebar-text${isCurrent ? " nav-item-active" : ""}`}
                    aria-current={isCurrent ? "page" : undefined}
                    tabIndex={open ? 0 : -1}
                    onMouseEnter={(e) => moveBar(e.currentTarget)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

type SidebarProps = {
  /** Key (label, or `key`) of the nav entry marked as the current page. */
  active: string;
  /** Calendar mode: icon rail that expands while hovered. */
  peek?: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ active, peek = false, mobileOpen, onCloseMobile }: SidebarProps) {
  // The original reads the cookie on the server; here the first paint is the simplified menu.
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "simple" as const);
  const entries = entriesFor(mode, active);
  const [peekOpen, setPeekOpen] = useState(false);
  // A group holding the current page starts open, like the original (only one at a time).
  const activeGroup = entries.find((e): e is GroupEntry => e.kind === "group" && !e.searchOnly && holdsActive(e, active))?.label ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);
  const [query, setQuery] = useState("");
  const [kbd, setKbd] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Ctrl + K focuses the page search, like the original.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = query.trim() ? searchHits(searchIndex(entries), query) : [];
  const search = (v: string) => {
    setQuery(v);
    setKbd(0); // the first result is pre-selected (Enter opens it), like a command palette
  };
  const rows = () => Array.from(resultsRef.current?.querySelectorAll<HTMLAnchorElement>(".sidebar-search-result") ?? []);
  const moveKbd = (i: number) => {
    const n = hits.length;
    const next = ((i % n) + n) % n;
    setKbd(next);
    rows()[next]?.scrollIntoView({ block: "nearest" });
  };

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
          <img src={withBase("/brand/logo.png")} alt="Seiri" className="sidebar-logo sidebar-logo--light h-[1.875rem] w-auto select-none" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/brand/logo-minimal.png")} alt="" aria-hidden="true" className="cal-peek-logo hidden h-8 w-8 select-none" draggable={false} />
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
            onChange={(e) => search(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.stopPropagation();
                search("");
              } else if (e.key === "ArrowDown" && hits.length) {
                e.preventDefault();
                moveKbd(kbd + 1);
              } else if (e.key === "ArrowUp" && hits.length) {
                e.preventDefault();
                moveKbd(kbd - 1);
              } else if (e.key === "Enter" && hits.length) {
                e.preventDefault();
                const row = rows()[kbd];
                row?.classList.add("is-kbd-press");
                setTimeout(() => row?.click(), 170);
              }
            }}
          />
          <kbd className="hui-search-kbd" aria-hidden="true">
            Ctrl + K
          </kbd>
          <button
            type="button"
            className="hui-search-clear"
            aria-label="Limpar busca"
            onClick={() => {
              search("");
              inputRef.current?.focus();
            }}
          >
            <CloseCircleIcon className="w-4 h-4" />
          </button>
        </label>
        <div className="cal-peek-search hidden" aria-hidden="true">
          <SearchOutlineIcon className="w-[18px] h-[18px]" />
        </div>
      </div>

      <nav className="sidebar-scroll-fade scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-2 px-5 pt-5" role="navigation" aria-label="Sidebar">
        {query.trim() ? (
          hits.length ? (
            <div ref={resultsRef} className="space-y-1">
              {hits.map((h, i) => (
                <a
                  key={`${h.group ?? ""}-${h.label}-${i}`}
                  href={h.href ?? "#"}
                  className={`snav-row sidebar-search-result nav-item-idle${i === kbd ? " is-kbd-active" : ""}`}
                  aria-selected={i === kbd ? true : undefined}
                  onMouseMove={() => i !== kbd && setKbd(i)}
                >
                  <span className="sidebar-group-icon inline-flex shrink-0">
                    <h.icon className="sidebar-icon w-[18px] h-[18px]" />
                  </span>
                  <span className="snav-label sidebar-text">{h.label}</span>
                  {h.group && <span className="sidebar-search-group sidebar-text">{h.group}</span>}
                </a>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">Nenhuma página encontrada.</p>
          )
        ) : (
          <div className="space-y-1.5">
            {entries.map((entry, i) => {
              if (entry.kind === "divider") return <hr key={i} className="sidebar-zone-divider" aria-hidden="true" />;
              if (entry.kind === "link") {
                const current = keyOf(entry) === active || !!entry.activeFor?.includes(active);
                const link = (
                  <a
                    href={entry.href ?? "#"}
                    className={`snav-row nav-item ${current ? "nav-item-active" : "nav-item-idle"}`}
                    aria-current={current ? "page" : undefined}
                  >
                    <entry.icon className="sidebar-icon w-[18px] h-[18px]" />
                    <span className="snav-label sidebar-text font-medium">{entry.label}</span>
                  </a>
                );
                // Entries the original can hide sit in a wrapper div toggled with `hidden`.
                return entry.hide ? (
                  <div key={i} className={isHidden(entry.hide, mode, current) ? "hidden" : ""}>
                    {link}
                  </div>
                ) : (
                  <Fragment key={i}>{link}</Fragment>
                );
              }
              if (entry.searchOnly) return null;
              const group = (
                <Group
                  entry={entry}
                  mode={mode}
                  active={active}
                  open={openGroup === entry.label}
                  onToggle={() => setOpenGroup(openGroup === entry.label ? null : entry.label)}
                />
              );
              return entry.hide ? (
                <div key={i} className={isHidden(entry.hide, mode, false) ? "hidden" : ""}>
                  {group}
                </div>
              ) : (
                <Fragment key={i}>{group}</Fragment>
              );
            })}
            <div>
              <hr className="sidebar-zone-divider" aria-hidden="true" />
              <button type="button" className="snav-row nav-item-idle sidebar-menu-toggle cursor-pointer" onClick={toggleMode}>
                {mode === "full" ? <CaretUpIcon className="sidebar-icon w-[18px] h-[18px]" /> : <CaretDownIcon className="sidebar-icon w-[18px] h-[18px]" />}
                <span className="snav-label sidebar-text">{mode === "full" ? "Mostrar menu simplificado" : "Mostrar todas as opções"}</span>
              </button>
            </div>
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
              <a href={ROUTES.planos} className="sidebar-plan-cta" title="Fazer upgrade">
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
