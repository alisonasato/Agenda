"use client";

import { withBase } from "@/lib/basePath";
import { useData } from "@/lib/seiri/store";
import { ROUTES } from "./Sidebar";
import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  ActivityIcon,
  ArrowRightIcon,
  BellIcon,
  BellSleepIcon,
  CalendarIcon,
  CheckReadIcon,
  DotsIcon,
  GlobeIcon,
  LogoutIcon,
  SidebarClosedIcon,
  SidebarOpenIcon,
  SidebarThemeIcon,
  UserCircleIcon,
} from "./icons";
import { useDismiss } from "./useDismiss";

const FLAGS = withBase("/brand/flags");
const LANGUAGES = [
  { label: "English", flag: "england_flag.svg" },
  { label: "Deutsch", flag: "germany_flag.svg" },
  { label: "Español", flag: "spain_flag.svg" },
  { label: "Français", flag: "france_flag.svg" },
  { label: "Português", flag: "brazil_flag.svg", active: true },
];

function useToggle() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  return { open, setOpen, ref, close };
}

type HMenuProps = { label: string; icon: ReactNode; minWidth: string; children: (close: () => void) => ReactNode };

function HMenu({ label, icon, minWidth, children }: HMenuProps) {
  const { open, setOpen, ref, close } = useToggle();
  return (
    <div ref={ref} className="hinline hmenu">
      <span className="hmenu-trigger-slot">
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`tbtn${open ? " bg-slate-100" : ""}`}
          onClick={() => setOpen((o) => !o)}
        >
          {icon}
        </button>
      </span>
      {open && (
        <div className="hselect-popover hmenu-popover" role="menu" style={{ minWidth }}>
          {children(close)}
        </div>
      )}
    </div>
  );
}

function LanguageItems({ close }: { close: () => void }) {
  return LANGUAGES.map((l) =>
    l.active ? (
      <span key={l.label} className="hmenu-item hmenu-item--active" role="menuitem" aria-current="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${FLAGS}/${l.flag}`} alt="" className="hmenu-item-media" />
        <span className="hmenu-item-label">{l.label}</span>
        <CheckReadIcon className="hmenu-item-check w-4 h-4" />
      </span>
    ) : (
      <button key={l.label} type="button" className="hmenu-item" role="menuitem" onClick={close}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${FLAGS}/${l.flag}`} alt="" className="hmenu-item-media" />
        <span className="hmenu-item-label">{l.label}</span>
      </button>
    ),
  );
}

function Notifications() {
  const { open, setOpen, ref } = useToggle();
  // The bell shows the unread ones; the inbox behind "Ver Todos" shows every notification.
  const unread = useData().notifications.filter((n) => !n.read);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Notificações" className={`relative tbtn${open ? " bg-slate-100" : ""}`} onClick={() => setOpen((o) => !o)}>
        <BellIcon className="w-5 h-5" />
        {unread.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[color:var(--color-danger)]" aria-hidden="true" />}
      </button>
      {open && (
        <div className="dropdown-panel absolute right-0 top-12 w-80 z-[70]">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Notificações</h3>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
            <ul>
              {unread.length ? (
                unread.map((n) => (
                  <li key={n.id}>
                    <a href={ROUTES.notificacoesInbox} className="block rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.at}</p>
                    </a>
                  </li>
                ))
              ) : (
                <li className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-gray-300">
                    <BellSleepIcon className="w-8 h-8" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-gray-700">Nenhuma notificação não lida</p>
                  <p className="text-xs text-gray-400 mt-1">Você está em dia!</p>
                </li>
              )}
            </ul>
          </div>
          <div className="p-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <a
              href={ROUTES.notificacoesInbox}
              className="flex items-center gap-2 py-1 text-sm text-primary hover:opacity-80 font-medium transition-colors ml-auto"
            >
              Ver Todos
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

type TopbarProps = { title?: string; header?: ReactNode; email: string; onToggleSidebar: () => void };

export function Topbar({ title, header, email, onToggleSidebar }: TopbarProps) {
  // "Sua Conta" can change the signed-in address, so the menu follows the owner's record.
  const owner = useData().members.find((m) => m.profile === "owner");
  const signedInAs = owner?.email || email;
  const [blueSidebar, setBlueSidebar] = useState(false);

  return (
    <nav className="topbar hui-enter sticky top-0 z-40 h-16 flex items-center gap-2 bg-[#F7F9FB]/90 backdrop-blur px-3 md:px-6">
      <button type="button" aria-label="Alternar menu" id="sidebarCollapseToggle" className="flex-shrink-0 tbtn" onClick={onToggleSidebar}>
        <span className="tbtn-toggle-icons" aria-hidden="true">
          {/* Which icon shows is driven by body.sidebar-collapsed in CSS. */}
          <SidebarOpenIcon className="tbtn-toggle-ico tbtn-toggle-ico--open w-5 h-5" />
          <SidebarClosedIcon className="tbtn-toggle-ico tbtn-toggle-ico--closed w-5 h-5" />
        </span>
      </button>
      <div className="min-w-0 flex-1">
        {header ?? (
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-slate-900 nunito-bold">{title}</h1>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="md:hidden">
          <HMenu label="Mais opções" minWidth="14rem" icon={<DotsIcon className="w-5 h-5" />}>
            {(close) => <LanguageItems close={close} />}
          </HMenu>
        </div>
        <Notifications />
        <div className="hidden md:block">
          <HMenu label="Idioma" minWidth="13rem" icon={<GlobeIcon className="w-5 h-5" />}>
            {(close) => <LanguageItems close={close} />}
          </HMenu>
        </div>
        <button type="button" title="Atividade recente" aria-label="Atividade recente" className="hidden lg:inline-flex notification-sidebar-toggle tbtn">
          <ActivityIcon className="w-5 h-5" />
        </button>
        <HMenu label="Conta" minWidth="15rem" icon={<UserCircleIcon className="w-5 h-5" />}>
          {(close) => (
            <>
              <div className="hmenu-header">
                <p className="hmenu-header-label">Conectado como</p>
                <p className="hmenu-header-value" title={signedInAs}>
                  {signedInAs}
                </p>
              </div>
              <a href={ROUTES.minhaConta} className="hmenu-item" role="menuitem" onClick={close}>
                <UserCircleIcon className="hmenu-item-icon w-4 h-4" />
                <span className="hmenu-item-label">Minha Conta</span>
              </a>
              {/* The original's /agendamentos/meus-agendamentos/ lists what the signed-in user booked as a
                  client somewhere; with none, it redirects to the agendas, which is what this does. */}
              <a href={ROUTES.configurarAgendas} className="hmenu-item" role="menuitem" onClick={close}>
                <CalendarIcon className="hmenu-item-icon w-4 h-4" />
                <span className="hmenu-item-label">Meus agendamentos</span>
              </a>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={blueSidebar}
                title="Barra lateral azul"
                className="hmenu-item hmenu-item--switch hswitch hswitch--accent"
                onClick={() => setBlueSidebar((v) => !v)}
              >
                <SidebarThemeIcon className="hmenu-item-icon w-4 h-4" />
                <span className="hmenu-item-label">Barra lateral azul</span>
                <span className="hswitch-track" aria-hidden="true">
                  <span className="hswitch-thumb" />
                </span>
              </button>
              <div className="hmenu-divider" aria-hidden="true" />
              <a href="#" className="hmenu-item hmenu-item--danger" role="menuitem" onClick={close}>
                <LogoutIcon className="hmenu-item-icon w-4 h-4" />
                <span className="hmenu-item-label">Sair</span>
              </a>
            </>
          )}
        </HMenu>
      </div>
    </nav>
  );
}
