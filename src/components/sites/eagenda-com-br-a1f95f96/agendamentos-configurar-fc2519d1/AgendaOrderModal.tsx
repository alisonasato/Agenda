"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { CaretDownIcon, CaretUpIcon, SortIcon } from "../shared/icons";
import { update, useData } from "@/lib/seiri/store";

/** Clone of "Organizar agendas": the order every booking screen reads. */
export function AgendaOrderModal({ onClose }: { onClose: () => void }) {
  const data = useData();
  const [order, setOrder] = useState(data.agendas.map((a) => a.id));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
  };

  const save = () => {
    update((d) => ({ ...d, agendas: order.map((id) => d.agendas.find((a) => a.id === id)!).filter(Boolean) }));
    onClose();
  };

  return (
    <Modal
      id="agenda-order-modal"
      title="Organizar agendas"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            Salvar ordem
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600 inter-regular">
        Arraste pela alça ou use as setas. A ordem vale para todas as telas de agendamento — é global por organização.
      </p>
      <ol className="mt-4 rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {order.map((id, index) => {
          const agenda = data.agendas.find((a) => a.id === id);
          return (
            <li key={id} className="flex items-center gap-3 px-4 py-3">
              <SortIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 inter-regular w-4">{index + 1}</span>
              <span className="text-sm text-gray-900 inter-semibold flex-1 truncate">{agenda?.name ?? "—"}</span>
              <button
                type="button"
                className="btn-icon btn-icon-sm btn-icon-flat"
                title="Mover para cima"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <CaretUpIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="btn-icon btn-icon-sm btn-icon-flat"
                title="Mover para baixo"
                disabled={index === order.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <CaretDownIcon className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ol>
    </Modal>
  );
}
