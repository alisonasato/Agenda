"use client";

import { useState } from "react";
import { AlertDialog } from "../shared/AlertDialog";
import { AutocompleteMulti } from "../shared/AutocompleteMulti";
import { Modal, ModalSubmit } from "../shared/Modal";
import { DangerCircleIcon, PenIcon, SaveIcon, TrashIcon, UserAddIcon, UsersDuoIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { MEMBER_PERMISSIONS, type UserGroup } from "@/lib/seiri/types";

const COLUMNS: [string, boolean][] = [
  ["Nome do Grupo", false],
  ["Descrição", false],
  ["Permissões", true],
  ["Membros Ativos", true],
  ["Status", false],
];

/** "Grupos de Usuários": the permission groups a team is split into. */
export function UserGroups() {
  const data = useData();
  const [editing, setEditing] = useState<UserGroup | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<UserGroup | null>(null);

  const rows = data.userGroups;
  const remove = (id: string) => update((d) => ({ ...d, userGroups: d.userGroups.filter((g) => g.id !== id) }));

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="mb-4 hui-reveal">
        <button type="button" className="hbtn hbtn--primary hbtn--sm" onClick={() => setCreating(true)}>
          <UserAddIcon />
          Novo Grupo
        </button>
      </div>

      <div className="hui-reveal" style={{ animationDelay: ".04s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Grupos Cadastrados</h2>
            <p className="hwidget-desc">Grupos de permissão da sua equipe: atribua membros e permissões para controlar o que cada pessoa pode acessar.</p>
          </div>
          <div className="hwidget-actions" />
        </div>
        <div id="groups-table-container" className="mt-3">
          <div className="htable">
            <div className="htable-scroll">
              <table className="htable-table">
                <thead>
                  <tr>
                    {COLUMNS.map(([c, num]) => (
                      <th key={c} className={`htable-col${num ? " htable-col--num" : ""}`}>
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((group) => (
                      <tr key={group.id}>
                        <td className="htable-cell">
                          <span className="text-sm font-semibold text-gray-900 inter-semibold">{group.name}</span>
                        </td>
                        <td className="htable-cell htable-cell--muted">{group.description || "—"}</td>
                        <td className="htable-cell htable-cell--num">{group.permissions.length}</td>
                        <td className="htable-cell htable-cell--num">{group.memberIds.filter((id) => data.members.find((m) => m.id === id)?.active).length}</td>
                        <td className="htable-cell">
                          <span className={`hchip ${group.active ? "hchip--success" : "hchip--default"} hchip--primary hchip--sm`}>
                            {group.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="htable-cell htable-cell--end whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" className="btn-icon btn-icon-sm btn-icon-flat" title="Editar" onClick={() => setEditing(group)}>
                              <PenIcon className="w-4 h-4" />
                            </button>
                            <button type="button" className="btn-icon btn-icon-sm btn-icon-danger" title="Excluir" onClick={() => setRemoving(group)}>
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="htable-cell">
                        <div className="flex flex-col items-center justify-center text-center py-10">
                          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 mb-3">
                            <UsersDuoIcon className="w-5 h-5" />
                          </span>
                          <p className="text-sm text-gray-500 inter-regular">Nenhum grupo cadastrado</p>
                          <p className="text-xs text-gray-400 inter-regular mt-1">Crie um novo grupo para organizar as permissões da sua equipe.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="htable-footer" />
          </div>
        </div>
      </div>

      {(creating || editing) && <GroupModal group={editing ?? undefined} onClose={() => (editing ? setEditing(null) : setCreating(false))} />}
      {removing && (
        <AlertDialog
          id="group-delete-dialog"
          heading="Excluir este grupo?"
          icon={<DangerCircleIcon className="w-6 h-6" />}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className="hbtn hbtn--tertiary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="hbtn hbtn--danger"
                onClick={() => {
                  remove(removing.id);
                  setRemoving(null);
                }}
              >
                <TrashIcon />
                Excluir
              </button>
            </>
          }
        >
          <p>
            O grupo <strong className="font-semibold">{removing.name}</strong> deixa de valer, e os seus membros perdem as permissões que vinham dele.
          </p>
        </AlertDialog>
      )}
    </div>
  );
}

function GroupModal({ group, onClose }: { group?: UserGroup; onClose: () => void }) {
  const data = useData();
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [members, setMembers] = useState<string[]>(group?.memberIds ?? []);
  const [permissions, setPermissions] = useState<string[]>(group?.permissions ?? []);

  const save = () => {
    if (!name.trim()) return;
    update((d) => {
      const row: UserGroup = {
        id: group?.id ?? nextId("gr", d.userGroups),
        name: name.trim(),
        description: description.trim(),
        memberIds: members,
        permissions,
        active: group?.active ?? true,
      };
      return { ...d, userGroups: group ? d.userGroups.map((g) => (g.id === group.id ? row : g)) : [...d.userGroups, row] };
    });
    onClose();
  };

  return (
    <Modal
      id="group-form-modal"
      title={group ? "Editar Grupo de Usuários" : "Criar Grupo de Usuários"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="group-form-modal" form="group-form" icon={<SaveIcon />} label="Salvar" />
        </>
      }
    >
      <form
        id="group-form"
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="id_name">
            Nome do Grupo <span className="hinput-req">*</span>
          </label>
          <div className="hinput-wrap">
            <input
              id="id_name"
              maxLength={50}
              className="hinput"
              type="text"
              name="name"
              placeholder="Ex.: Equipe de Atendimento"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="hinput-field hinput-field--block">
          <label htmlFor="id_description" className="hinput-label">
            Descrição
          </label>
          <textarea
            name="description"
            id="id_description"
            rows={3}
            className="htextarea mt-1.5"
            placeholder="Descreva o objetivo deste grupo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <AutocompleteMulti
          id="id_members"
          name="members"
          label="Membros do Grupo"
          placeholder="Digite para buscar membros..."
          options={data.members.map((m) => ({ id: m.id, label: m.name }))}
          values={members}
          onChange={setMembers}
        />

        <AutocompleteMulti
          id="id_permissions"
          name="permissions"
          label="Permissões do Grupo"
          placeholder="Digite para buscar permissões..."
          options={MEMBER_PERMISSIONS.map((p) => ({ id: p, label: p }))}
          values={permissions}
          onChange={setPermissions}
        />
      </form>
    </Modal>
  );
}
