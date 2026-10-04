"use client";

import { useState, type CSSProperties } from "react";
import {
  CalendarIcon,
  CopyIcon,
  DownloadIcon,
  InboxIcon,
  PenIcon,
  RefreshIcon,
  SearchSolidIcon,
  TagIcon,
  TrashIcon,
  UploadIcon,
  UserAddIcon,
  UsersIcon,
} from "../shared/icons";
import { InlineFilter } from "../shared/InlineFilter";
import { ScrollRail } from "../shared/ScrollRail";
import { ROUTES } from "../shared/Sidebar";
import { fold } from "@/lib/seiri/select";
import { update, useData } from "@/lib/seiri/store";

const COLUMNS = ["Cliente ID", "Cliente", "Email", "Empresa", "Agendamentos", "Limites", "Status"];
const SLOTS = 10;

/** "Acesso Individual de Clientes": one row per client some access list lets in. */
export function IndividualAccess() {
  const data = useData();
  const [search, setSearch] = useState("");
  const [agendas, setAgendas] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  // A client is listed here when at least one access list names it.
  const rows = data.clients
    .map((client) => ({ client, lists: data.accessLists.filter((l) => l.clientIds.includes(client.id)) }))
    .filter(({ client, lists }) => {
      if (!lists.length) return false;
      const agendaNames = (ids: string[]) => ids.map((id) => data.agendas.find((a) => a.id === id)?.name ?? "");
      const serviceNames = (ids: string[]) => ids.map((id) => data.services.find((x) => x.id === id)?.name ?? "");
      if (agendas.length && !lists.some((l) => !l.agendaIds.length || agendaNames(l.agendaIds).some((n) => agendas.includes(n)))) return false;
      if (services.length && !lists.some((l) => !l.serviceIds.length || serviceNames(l.serviceIds).some((n) => services.includes(n)))) return false;
      const text = fold(`${client.name} ${client.email} ${client.cpf ?? ""} ${client.companyCnpj ?? ""}`);
      return !search.trim() || text.includes(fold(search.trim()));
    });

  const clear = () => {
    setSearch("");
    setAgendas([]);
    setServices([]);
  };

  const remove = (clientId: string) =>
    update((d) => ({ ...d, accessLists: d.accessLists.map((l) => ({ ...l, clientIds: l.clientIds.filter((id) => id !== clientId) })) }));

  const copy = (client: (typeof rows)[number]["client"]) => {
    const link = `${ROUTES.telaPublica}/?cliente=${client.accessKey ?? client.id}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(client.id);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 hui-reveal">
        <label className={`hui-search min-w-0 flex-1${search ? " has-query" : ""}`}>
          <SearchSolidIcon className="hui-search-icon w-[18px] h-[18px]" />
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            className="hui-search-input"
            placeholder="Nome, E-mail, CPF ou CNPJ"
            aria-label="Nome, E-mail, CPF ou CNPJ"
            name="search"
            id="id_search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <a href={`${ROUTES.acessoClientes}/?action=create`} className="hbtn hbtn--primary hbtn--sm">
          <UserAddIcon />
          Novo Cliente
        </a>
      </div>

      <div className="mt-4 min-w-0 hui-reveal" style={{ animationDelay: ".02s" }}>
        <ScrollRail className="hactionbar" trackClassName="hrail-track hactionbar-track">
          <InlineFilter
            label="Agenda"
            icon={<CalendarIcon className="hinline-icon w-4 h-4" />}
            options={data.agendas.map((a) => a.name)}
            values={agendas}
            onChange={setAgendas}
          />
          <InlineFilter
            label="Serviço"
            icon={<TagIcon className="hinline-icon w-4 h-4" />}
            options={data.services.map((x) => x.name)}
            values={services}
            onChange={setServices}
          />
          <span className="hactionbar-sep" aria-hidden="true" />
          <a href={ROUTES.acessoClientes} className="hbtn hbtn--ghost hbtn--sm">
            <UsersIcon />
            <span className="hactionbar-label">Gestão em Lote</span>
          </a>
          <button type="button" className="hbtn hbtn--ghost hbtn--sm">
            <UploadIcon />
            <span className="hactionbar-label">Importar</span>
          </button>
          <button type="button" className="hbtn hbtn--ghost hbtn--sm">
            <DownloadIcon />
            <span className="hactionbar-label">Exportar</span>
          </button>
          <button type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={clear}>
            <RefreshIcon />
            Limpar filtros
          </button>
        </ScrollRail>
      </div>

      <div className="mt-4 hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.75rem" } as CSSProperties}>
          <div className="htable-scroll">
            <table className="htable-table w-full htable-fixed">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c} className="htable-col">
                      {c}
                    </th>
                  ))}
                  <th className="htable-col htable-col--end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ client, lists }) => (
                  <tr key={client.id} className="group">
                    <td className="htable-cell">
                      <span className="hchip hchip--default hchip--soft hchip--sm">
                        <span className="font-mono">{client.accessKey ?? client.id}</span>
                      </span>
                    </td>
                    <td className="htable-cell">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 inter-semibold truncate">{client.name}</p>
                      </div>
                    </td>
                    <td className="htable-cell">
                      <p className="text-sm text-gray-900 inter-regular">{client.email || "—"}</p>
                    </td>
                    <td className="htable-cell">
                      <p className="text-sm text-gray-700 inter-regular">{client.companyName || "—"}</p>
                    </td>
                    <td className="htable-cell">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">
                          {data.appointments.filter((a) => a.clientId === client.id && a.status === "ATTENDED").length}
                        </span>
                        <span className="text-xs text-gray-500 inter-regular">realizados</span>
                      </span>
                    </td>
                    <td className="htable-cell">
                      <span className="hchip hchip--default hchip--soft hchip--sm">
                        {lists.length} {lists.length === 1 ? lists[0].title : "listas"}
                      </span>
                    </td>
                    <td className="htable-cell">
                      <span className={`hchip ${client.inactive ? "hchip--default" : "hchip--success"} hchip--primary hchip--sm`}>
                        {client.inactive ? "Inativo" : "Ativo"}
                      </span>
                    </td>
                    <td className="htable-cell htable-cell--end">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="btn-icon btn-icon-sm"
                          title={copied === client.id ? "Link copiado com sucesso!" : "Copiar Link"}
                          aria-label="Copiar Link"
                          onClick={() => copy(client)}
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                        <a href={`${ROUTES.clienteEditar}/?id=${client.id}`} className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" aria-label="Editar">
                          <PenIcon className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          className="btn-icon btn-icon-sm btn-icon-danger"
                          title="Remover"
                          aria-label="Remover"
                          onClick={() => remove(client.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                  <tr key={i} className="htable-row--empty" aria-hidden="true">
                    {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                      <td key={j} className="htable-cell" />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && (
            <div className="htable-empty" role="status" aria-live="polite">
              <div className="hempty hempty--inline hui-reveal">
                <InboxIcon className="hempty-icon" />
                <h3 className="hempty-title nunito-bold">Nada por aqui ainda</h3>
                <p className="hempty-desc inter-regular">Assim que houver registros, eles aparecerão nesta tabela.</p>
              </div>
            </div>
          )}
          <div className="htable-footer" />
        </div>
      </div>
    </div>
  );
}
