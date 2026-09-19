"use client";

import { useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { DatePicker } from "../shared/DatePicker";
import { Modal } from "../shared/Modal";
import { TimePicker } from "../shared/TimePicker";
import {
  CalendarBlankIcon,
  CalendarPlusIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckboxMark,
  CloseCircleIcon,
  CopyIcon,
  LockDuoIcon,
  PlayIcon,
  PowerIcon,
  SearchSolidIcon,
  TuningIcon,
} from "../shared/icons";

type IconProps = { className?: string };
type ToolId = "block" | "hours" | "cancel" | "toggle" | "config" | "copy";

const TOOLS: {
  id: ToolId;
  title: string;
  desc: string;
  Icon: ComponentType<IconProps>;
  danger?: boolean;
}[] = [
  {
    id: "block",
    title: "Bloquear / Desbloquear Horários",
    desc: "Feche ou reabra períodos nas agendas.",
    Icon: LockDuoIcon,
  },
  {
    id: "hours",
    title: "Incluir Horários",
    desc: "Crie horários disponíveis em massa.",
    Icon: CalendarPlusIcon,
  },
  {
    id: "cancel",
    title: "Cancelar Agendamentos",
    desc: "Cancele os agendamentos de um período.",
    Icon: CalendarBlankIcon,
    danger: true,
  },
  {
    id: "toggle",
    title: "Ativar / Desativar Agendas",
    desc: "Controle quais agendas recebem agendamentos.",
    Icon: PowerIcon,
  },
  {
    id: "config",
    title: "Alterar Configuração",
    desc: "Atualize configurações em várias agendas.",
    Icon: TuningIcon,
  },
  {
    id: "copy",
    title: "Copiar Configuração",
    desc: "Replique a configuração de uma agenda nas demais.",
    Icon: CopyIcon,
  },
];

// The live account lists no agendas in these pickers.
const AGENDAS: { value: string; label: string }[] = [];
const AGENDA_CHIPS = AGENDAS.map((a) => ({ id: a.value, label: a.label }));
// "Responsável" lists the account's users (mock).
const OWNERS = [{ value: "1", label: "contato@exemplo.com.br" }];
const INTERVALS = [
  "00:05",
  "00:10",
  "00:15",
  "00:20",
  "00:30",
  "00:40",
  "00:45",
  "00:50",
  "01:00",
  "01:30",
  "02:00",
  "02:30",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "10:00",
  "12:00",
].map((l) => ({
  value: `${Number(l.slice(0, 2))}:${l.slice(3)}:00`,
  label: l,
}));

const MANUAL_COLUMNS: [string, boolean][] = [
  ["Agendas", false],
  ["Período", false],
  ["Horário", false],
  ["Intervalo", false],
  ["Máx. por horário", true],
];
const CONFIG_COLUMNS: [string, boolean][] = [
  ["Agenda", false],
  ["Status", false],
  ["Horários livres", true],
  ["Duração", false],
  ["Antecedência (mín–máx)", false],
  ["Cancelamento", false],
  ["Máx. por horário", true],
];

function EmptyTable({ id, columns, slots, empty }: { id?: string; columns: [string, boolean][]; slots: number; empty: ReactNode }) {
  return (
    <div
      id={id}
      className="htable htable-is-empty"
      style={
        {
          "--htable-row-h": "3.5rem",
          "--htable-head-h": "38px",
        } as CSSProperties
      }
    >
      <div className="htable-scroll">
        <table className="htable-table w-full htable-fixed">
          <thead>
            <tr>
              {columns.map(([c, num]) => (
                <th key={c} className={`htable-col${num ? " htable-col--num" : ""}`}>
                  {c}
                </th>
              ))}
              <th className="htable-col htable-col--end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: slots }, (_, i) => (
              <tr key={i} className="htable-row--empty" aria-hidden="true">
                {Array.from({ length: columns.length + 1 }, (_, j) => (
                  <td key={j} className="htable-cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="htable-empty" role="status" aria-live="polite">
        {empty}
      </div>
      <div className="htable-footer">
        <div className="htable-pagination" hidden />
      </div>
    </div>
  );
}

function Empty({ Icon, title, desc }: { Icon: ComponentType<IconProps>; title: string; desc: string }) {
  return (
    <div className="hempty hempty--inline hui-reveal">
      <Icon className="hempty-icon" />
      <h3 className="hempty-title nunito-bold">{title}</h3>
      <p className="hempty-desc inter-regular">{desc}</p>
    </div>
  );
}

function RadioPills({ name, options, value, onChange }: { name: string; options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="hradiogroup hradiogroup--grid"
      role="radiogroup"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map(([v, label]) => (
        <label key={v} className="hradio-pill">
          <input type="radio" className="hradio-input" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <span className="hradio-pill-label">{label}</span>
        </label>
      ))}
    </div>
  );
}

/** "Selecionar todas as agendas" + the agenda picker, hidden while "all" is checked. */
function AgendaTargets({ suffix }: { suffix: string }) {
  const [all, setAll] = useState(false);
  const [agendas, setAgendas] = useState<string[]>([]);
  return (
    <div className="space-y-3">
      <label className="hcheckbox">
        <input
          type="checkbox"
          name="all_ap_type"
          id={`id_all_ap_type_${suffix}`}
          className="hcheckbox-input"
          checked={all}
          onChange={(e) => setAll(e.target.checked)}
        />
        <span className="hcheckbox-box" aria-hidden="true">
          <CheckboxMark />
          <span className="hcheckbox-dash" aria-hidden="true" />
        </span>
        <span className="hcheckbox-label">Selecionar todas as agendas</span>
      </label>
      <div style={all ? { display: "none" } : undefined}>
        <ChipMultiSelect
          id={`agendas_${suffix}`}
          label="Agendas"
          placeholder="Selecione as agendas"
          options={AGENDA_CHIPS}
          values={agendas}
          onChange={setAgendas}
        />
      </div>
    </div>
  );
}

function DateField({ id, name, label, required }: { id: string; name: string; label: string; required?: boolean }) {
  const [today] = useState(() => new Date());
  const [value, setValue] = useState<Date | null>(null);
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
        {required && <span className="hinput-req">*</span>}
      </label>
      <DatePicker id={id} name={name} ariaLabel={label} value={value} onChange={setValue} today={today} />
    </div>
  );
}

function TimeField({ id, name, label, required }: { id: string; name: string; label: string; required?: boolean }) {
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
        {required && <span className="hinput-req">*</span>}
      </label>
      <TimePicker id={id} name={name} />
    </div>
  );
}

/** Date range + optional time range block shared by several modals. */
function Period({ suffix, timesRequired }: { suffix: string; timesRequired?: boolean }) {
  const opt = timesRequired ? "" : " (opcional)";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateField id={`id_initial_date_${suffix}`} name="initial_date" label="Data Inicial" required />
        <DateField id={`id_final_date_${suffix}`} name="final_date" label="Data Final (opcional)" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TimeField id={`id_start_time_${suffix}`} name="start_time" label={`Horário de Início${opt}`} required={timesRequired} />
        <TimeField id={`id_end_time_${suffix}`} name="end_time" label={`Horário de Fim${opt}`} required={timesRequired} />
      </div>
    </div>
  );
}

function NumberField({ id, name, label, min, max, desc }: { id: string; name: string; label: string; min?: string; max?: string; desc?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const bump = (up: boolean) => {
    if (!ref.current) return;
    if (up) ref.current.stepUp();
    else ref.current.stepDown();
    ref.current.dispatchEvent(new Event("input", { bubbles: true }));
  };
  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor={id}>
        {label}
      </label>
      <div className="hinput-wrap hinput-wrap--number">
        <input ref={ref} id={id} min={min} max={max} className="hinput" type="number" name={name} placeholder="" />
        <span className="hinput-stepper" aria-hidden="true">
          <button type="button" tabIndex={-1} className="hinput-step hinput-step--up" onClick={() => bump(true)}>
            <CaretUpIcon className="w-3 h-3" />
          </button>
          <button type="button" tabIndex={-1} className="hinput-step hinput-step--down" onClick={() => bump(false)}>
            <CaretDownIcon className="w-3 h-3" />
          </button>
        </span>
      </div>
      {desc && <p className="hinput-desc">{desc}</p>}
    </div>
  );
}

function Footer({ onClose, submit, danger }: { onClose: () => void; submit: string; danger?: boolean }) {
  return (
    <>
      <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
        Cancelar
      </button>
      <button type="submit" className={`hbtn ${danger ? "hbtn--danger" : "hbtn--primary"}`}>
        {submit}
      </button>
    </>
  );
}

// Nothing is applied in the prototype; the forms only collect input.
function ToolModal({ tool, onClose }: { tool: ToolId; onClose: () => void }) {
  const [action, setAction] = useState(tool === "toggle" ? "activate" : "block");
  const [interval, setInterval] = useState("");
  const [owner, setOwner] = useState("");
  const [source, setSource] = useState("");
  const id = `ctrl-modal-${tool}`;
  const common = { id, onClose, asForm: true };

  switch (tool) {
    case "block":
      return (
        <Modal
          {...common}
          title="Bloquear / Desbloquear Horários"
          subtitle="Deixe a data final vazia para aplicar em um único dia; informe os horários para limitar a uma faixa."
          footer={<Footer onClose={onClose} submit="Aplicar" />}
        >
          <div className="space-y-4">
            <RadioPills
              name="action"
              options={[
                ["block", "Bloquear"],
                ["unblock", "Desbloquear"],
              ]}
              value={action}
              onChange={setAction}
            />
            <AgendaTargets suffix="block" />
            <Period suffix="block" />
            <div style={action === "block" ? undefined : { display: "none" }}>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_reason_block">
                  Motivo do Bloqueio
                </label>
                <div className="hinput-wrap">
                  <input id="id_reason_block" disabled={action !== "block"} className="hinput" type="text" name="reason" placeholder="" />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      );
    case "hours":
      return (
        <Modal
          {...common}
          title="Incluir Horários"
          subtitle="Cria horários disponíveis no período informado, nas agendas selecionadas."
          footer={<Footer onClose={onClose} submit="Aplicar" />}
        >
          <div className="space-y-4">
            <input type="hidden" name="action" value="hours" />
            <AgendaTargets suffix="hours" />
            <Period suffix="hours" timesRequired />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Combobox
                  id="interval"
                  label="Intervalo entre horários"
                  options={INTERVALS}
                  value={interval}
                  onChange={setInterval}
                  placeholder="Escolha o intervalo"
                  clearable={false}
                />
              </div>
              <NumberField id="id_max_number_people_hours" name="max_number_people" label="Agendamentos por Horário" min="1" />
            </div>
          </div>
        </Modal>
      );
    case "cancel":
      return (
        <Modal
          {...common}
          title="Cancelar Agendamentos"
          subtitle="Todos os agendamentos confirmados no período (e faixa de horário, se informada) serão cancelados e os clientes notificados."
          footer={<Footer onClose={onClose} submit="Cancelar Agendamentos" danger />}
        >
          <div className="space-y-4">
            <input type="hidden" name="action" value="cancel" />
            <AgendaTargets suffix="cancel" />
            <Period suffix="cancel" />
          </div>
        </Modal>
      );
    case "toggle":
      return (
        <Modal
          {...common}
          size="md"
          title="Ativar / Desativar Agendas"
          subtitle="Agendas desativadas não recebem novos agendamentos."
          footer={<Footer onClose={onClose} submit="Aplicar" />}
        >
          <div className="space-y-4">
            <RadioPills
              name="action"
              options={[
                ["activate", "Ativar"],
                ["deactivate", "Desativar"],
              ]}
              value={action}
              onChange={setAction}
            />
            <AgendaTargets suffix="toggle" />
          </div>
        </Modal>
      );
    case "config":
      return (
        <Modal
          {...common}
          title="Alterar Configuração"
          subtitle="Somente os campos preenchidos serão aplicados às agendas selecionadas."
          footer={<Footer onClose={onClose} submit="Aplicar" />}
        >
          <div className="space-y-4">
            <input type="hidden" name="action" value="change_config" />
            <AgendaTargets suffix="config" />
            <div className="space-y-4">
              <div>
                <Combobox
                  id="owner_user"
                  label="Responsável pela Agenda"
                  options={OWNERS}
                  value={owner}
                  onChange={setOwner}
                  placeholder="Selecione um responsável"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField id="id_att_minimum_ante" name="att_minimum_ante" label="Antecedência mínima para agendamento (em horas)" min="0" />
                <NumberField id="id_att_max_time" name="att_max_time" label="Antecedência máxima para agendamento (em dias)" min="0" max="90" />
                <NumberField id="id_cancel_minimum_att" name="cancel_minimum_att" label="Prazo para cancelamento de agendamento - em horas" min="0" />
                <NumberField id="id_max_people" name="max_people" label="Número máximo de pessoas em um mesmo horário" min="1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField id="id_data_inicio" name="data_inicio" label="Data Inícial para Agendamentos" />
                <DateField id="id_data_fim" name="data_fim" label="Data Máxima para Agendamentos" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField id="id_min_age" name="min_age" label="Idade Mínima para o Agendamento" min="1" desc="Em anos completos" />
                <NumberField id="id_max_age" name="max_age" label="Idade Máxima para o Agendamento" min="1" desc="Em anos completos" />
              </div>
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_desc">
                  Informações sobre esse agendamento
                </label>
                <textarea
                  name="desc"
                  id="id_desc"
                  rows={4}
                  className="htextarea w-full"
                  placeholder="Descreva informações relevantes sobre este agendamento..."
                />
              </div>
            </div>
          </div>
        </Modal>
      );
    case "copy":
      return (
        <Modal
          {...common}
          size="md"
          title="Copiar Configuração"
          subtitle="A configuração da agenda de origem substitui a das agendas de destino."
          footer={<Footer onClose={onClose} submit="Aplicar" />}
        >
          <div className="space-y-4">
            <input type="hidden" name="action" value="copy_config" />
            <div>
              <Combobox
                id="agenda"
                label="Agenda de Origem"
                options={AGENDAS}
                value={source}
                onChange={setSource}
                placeholder="Selecione uma agenda"
                required
                clearable={false}
              />
            </div>
            <AgendaTargets suffix="copy" />
          </div>
        </Modal>
      );
  }
}

export function AgendaAdmin() {
  const [tool, setTool] = useState<ToolId | null>(null);
  const [query, setQuery] = useState("");

  return (
    <>
      <div className="hwidget-head">
        <div className="hwidget-titles">
          <h2 className="hwidget-title">Ações em Lote</h2>
          <p className="hwidget-desc">Aplique uma ação em várias agendas de uma só vez.</p>
        </div>
        <div className="hwidget-actions" />
      </div>
      <div className="mt-3 mb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map(({ id, title, desc, Icon, danger }) => (
          <button key={id} type="button" className={`ctrl-tool${danger ? " ctrl-tool--danger" : ""}`} onClick={() => setTool(id)}>
            <Icon className="w-7 h-7 ctrl-tool-glyph" />
            <span className="min-w-0 flex-1">
              <span className="ctrl-tool-title">{title}</span>
              <span className="ctrl-tool-desc">{desc}</span>
            </span>
            <PlayIcon className="w-4 h-4 ctrl-tool-arrow" />
          </button>
        ))}
      </div>

      <div className="hwidget-head">
        <div className="hwidget-titles">
          <h2 className="hwidget-title">Horários Manuais</h2>
          <p className="hwidget-desc">Horários criados manualmente pela ação Incluir Horários.</p>
        </div>
        <div className="hwidget-actions" />
      </div>
      <div id="manual-hours-table-container" className="mt-3 mb-10">
        <EmptyTable
          columns={MANUAL_COLUMNS}
          slots={5}
          empty={
            <Empty
              Icon={CalendarPlusIcon}
              title="Nenhum horário criado manualmente"
              desc="Use a ação Incluir Horários para criar horários em massa nas agendas."
            />
          }
        />
      </div>

      <div className="hwidget-head">
        <div className="hwidget-titles">
          <h2 className="hwidget-title">Configuração de Agendas</h2>
          <p className="hwidget-desc">Visão global das configurações aplicadas em cada agenda.</p>
        </div>
        <div className="hwidget-actions">
          <label className={`hui-search w-full sm:w-80${query ? " has-query" : ""}`}>
            <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="hui-search-input"
              placeholder="Buscar agendas pelo nome..."
              aria-label="Buscar agendas pelo nome..."
              id="config-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="hui-search-clear" aria-label="Limpar busca" onClick={() => setQuery("")}>
              <CloseCircleIcon className="w-4 h-4" />
            </button>
          </label>
        </div>
      </div>
      <div className="mt-3">
        <div id="config-table">
          <EmptyTable
            columns={CONFIG_COLUMNS}
            slots={10}
            // With no agendas at all the live page keeps this variant even while searching.
            empty={<Empty Icon={CalendarBlankIcon} title="Nenhuma agenda configurada" desc="Crie uma agenda para vê-la aqui." />}
          />
        </div>
      </div>

      {tool && <ToolModal key={tool} tool={tool} onClose={() => setTool(null)} />}
    </>
  );
}
