import type { CSSProperties, ReactNode } from "react";
import { CalendarAddIcon, CalendarIcon, SettingsIcon } from "../shared/icons";

// Mock data: one active agenda, neither national nor state holidays blocking yet.
const AGENDA_CONFIG = [{ name: "Agenda Principal", national: "Não", state: "Não" }];

const EMPTY_TITLE = "Nada por aqui ainda";
const EMPTY_DESC = "Assim que houver registros, eles aparecerão nesta tabela.";

function SectionHead({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="hwidget-head">
      <div className="hwidget-titles">
        <h2 className="hwidget-title">{title}</h2>
        <p className="hwidget-desc">{desc}</p>
      </div>
      <div className="hwidget-actions">{action}</div>
    </div>
  );
}

function EmptyRows({ count, columns }: { count: number; columns: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i} className="htable-row--empty" aria-hidden="true">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="htable-cell" />
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="htable-empty" role="status" aria-live="polite">
      <div className="hempty hempty--inline hui-reveal">
        <CalendarIcon className="hempty-icon" />
        <h3 className="hempty-title nunito-bold">{EMPTY_TITLE}</h3>
        <p className="hempty-desc inter-regular">{EMPTY_DESC}</p>
      </div>
    </div>
  );
}

const ROW_H = { "--htable-row-h": "3.25rem", "--htable-head-h": "38px" } as CSSProperties;

export function HolidaysPage() {
  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div>
        <SectionHead
          title="Configuração de Feriados das Suas Agendas Ativas"
          desc="Indique, por agenda, se feriados nacionais e estaduais devem bloquear o atendimento."
        />
        <div id="feriados-config-content">
          <div className="htable" style={ROW_H}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Agenda</th>
                    <th className="htable-col">Bloquear em Feriados Nacionais</th>
                    <th className="htable-col">Bloquear Feriados Estaduais</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENDA_CONFIG.map((a) => (
                    <tr key={a.name}>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">{a.name}</span>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--default hchip--primary hchip--sm">{a.national}</span>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="hchip hchip--default hchip--primary hchip--sm">{a.state}</span>
                      </td>
                      <td className="htable-cell htable-cell--end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            className="btn-icon btn-icon-sm btn-icon-flat"
                            title="Editar Configuração"
                            aria-label="Editar configuração de feriado"
                          >
                            <SettingsIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <EmptyRows count={6 - AGENDA_CONFIG.length} columns={4} />
                </tbody>
              </table>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionHead
          title="Feriados Customizados"
          desc="Lista de feriados locais, recessos, dias sem atendimento e períodos com atendimento reduzido."
          action={
            <button type="button" className="hbtn hbtn--primary">
              <CalendarAddIcon className="w-4 h-4" />
              Adicionar Feriado
            </button>
          }
        />
        <div id="feriados-customizados-content">
          <div className="htable htable-is-empty" style={ROW_H}>
            <div className="htable-scroll">
              <table className="htable-table w-full htable-fixed">
                <thead>
                  <tr>
                    <th className="htable-col">Dia</th>
                    <th className="htable-col">Horário</th>
                    <th className="htable-col">Descrição</th>
                    <th className="htable-col">Aplicar nas Agendas</th>
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <EmptyRows count={6} columns={5} />
                </tbody>
              </table>
            </div>
            <EmptyState />
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionHead
          title="Feriados do Sistema"
          desc="Lista de feriados já existentes no sistema. Na configuração da agenda, indique se é para considerar os feriados nacionais ou estaduais."
        />
        <div className="htable htable-is-empty" style={ROW_H}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  <th className="htable-col">Dia</th>
                  <th className="htable-col">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <EmptyRows count={10} columns={2} />
              </tbody>
            </table>
          </div>
          <EmptyState />
          <div className="htable-footer">
            <div className="htable-pagination" hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
