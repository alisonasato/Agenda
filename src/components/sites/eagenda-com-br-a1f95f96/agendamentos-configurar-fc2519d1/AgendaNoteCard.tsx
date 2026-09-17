import type { CSSProperties } from "react";
import {
  ActivityIcon,
  CalendarIcon,
  ChatIcon,
  CheckReadIcon,
  CloseCircleIcon,
  LinkIcon,
  SettingsIcon,
  UsersIcon,
  WidgetIcon,
} from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { WEEKDAY_TABS, type Agenda } from "./agendas";

// The "notebook" card: weekday tabs on the spine, then head, vitals, schedule, rules and footer.
export function AgendaNoteCard({ agenda }: { agenda: Agenda }) {
  return (
    <div className="hnote h-full config_card hui-card hui-card--flush" style={{ "--hnote-color": agenda.color } as CSSProperties}>
      <div className="hnote-tabs">
        {WEEKDAY_TABS.map((d, i) => (
          <a key={i} className="hnote-tab" href="#" title={`${d.title} · Editar horários de atendimento`} aria-label={`${d.title} · Editar horários de atendimento`}>
            <span>{d.initial}</span>
          </a>
        ))}
      </div>
      <span className="hnote-hooks" aria-hidden="true">
        <span />
        <span />
      </span>

      <div className="hnote-page">
        <header className="hnote-head">
          <div className="hnote-head-row">
            <span className="hnote-mark">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <h5 className="hnote-title nunito-bold">
              <span>{agenda.name}</span>
            </h5>
            <div className="hnote-quick">
              <a href="#" className="btn-icon btn-icon-sm btn-icon-solid" title="Abrir link público de agendamento">
                <LinkIcon className="w-4 h-4" />
              </a>
              <a href="#" className="btn-icon btn-icon-sm" title="Configurar Email">
                <ChatIcon className="w-4 h-4" />
              </a>
              <a href="#" className="btn-icon btn-icon-sm" title="Logs">
                <ActivityIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="hnote-chips">
            {agenda.problems && (
              <span role="button" tabIndex={0} title="Ver problemas" className="cursor-pointer hover:brightness-95 transition hchip hchip--warning hchip--primary hchip--sm">
                <CloseCircleIcon className="w-3 h-3" /> Problemas
              </span>
            )}
            {agenda.videoconference && (
              <span className="hchip hchip--accent hchip--primary hchip--sm">
                <WidgetIcon className="w-3 h-3" /> Videoconferência
              </span>
            )}
          </div>
        </header>

        <div className="hnote-body">
          <div className="hnote-vitals">
            <a className="hnote-vital" title="Ver os agendamentos desta agenda nos próximos 30 dias" href={ROUTES.agendamentos}>
              <span className="hnote-vital-in">
                <span className="hnote-vital-n nunito-bold">{agenda.upcoming}</span>
                <span className="hnote-vital-l">Agendamentos futuros</span>
              </span>
            </a>
            <a className="hnote-vital hnote-vital--free" title="Ver no calendário a semana do próximo horário livre" href={ROUTES.calendario}>
              <span className="hnote-vital-in">
                <span className="hnote-vital-n nunito-bold">{agenda.freeSlots}</span>
                <span className="hnote-vital-l">Horários livres</span>
              </span>
            </a>
            <div className="hnote-vital">
              <span className="hnote-vital-n hnote-vital-n--date nunito-bold">{agenda.lastDate}</span>
              <span className="hnote-vital-l">Última data</span>
            </div>
          </div>

          <section>
            <div className="hnote-blockhead">
              <span className="hnote-eyebrow inter-semibold">Horários de atendimento</span>
              <a className="hnote-blockhead-link inter-semibold" href="#">
                Ver/Editar todos os horários
              </a>
            </div>
            <div className="hnote-sched">
              <div className="hnote-row hnote-row--none">Nenhum horário configurado</div>
            </div>
          </section>

          <div className="hnote-rules inter-regular">
            <span className="hnote-rule-l">Duração</span>
            <b className="hnote-rule-v">{agenda.duration}</b>
            <span className="hnote-rule-l">Opções a cada</span>
            <b className="hnote-rule-v">{agenda.step}</b>
            <span className="hnote-rule-l">Máx./horário</span>
            <b className="hnote-rule-v">{agenda.maxPerSlot}</b>
            <span className="hnote-rule-l">Antecedência</span>
            <b className="hnote-rule-v">{agenda.notice}</b>
          </div>

          <div className="hnote-facts inter-regular">
            <div className="hnote-fact">
              <UsersIcon className="w-3.5 h-3.5" />
              <span className="hnote-fact-l">Pede ao cliente</span>
              <span className="hnote-fact-v">{agenda.asks}</span>
            </div>
            <div className="hnote-fact">
              <ChatIcon className="w-3.5 h-3.5" />
              <span className="hnote-fact-l">Notificações</span>
              <span className="hnote-fact-v hnote-fact-onoffs">
                {agenda.notifications.map((n) => (
                  <span key={n.label} className={`hnote-onoff${n.on ? "" : " is-off"}`}>
                    <CheckReadIcon className="w-3 h-3" /> {n.label}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>

        <footer className="hnote-foot">
          <a href="#" className="hbtn hbtn--primary hbtn--sm">
            <SettingsIcon className="w-4 h-4" />
            Configurar
          </a>
          <a href={ROUTES.calendario} className="hbtn hbtn--secondary hbtn--sm">
            <CalendarIcon className="w-4 h-4" />
            Ver Agenda
          </a>
          <span className="hnote-foot-gap" />
          <span className="flex items-center gap-1">
            <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Atualizar">
              <ActivityIcon className="w-4 h-4" />
            </button>
            <button type="button" className="btn-icon btn-icon-sm btn-icon-warning" title="Desativar">
              <CloseCircleIcon className="w-4 h-4" />
            </button>
            <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir">
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </span>
        </footer>
      </div>
    </div>
  );
}
