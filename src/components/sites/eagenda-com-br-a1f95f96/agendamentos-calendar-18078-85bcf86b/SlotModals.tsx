"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { Combobox } from "../shared/Combobox";
import { TimePicker } from "../shared/TimePicker";
import { CalendarIcon, ClockIcon, LockIcon } from "../shared/icons";
import { nextId, update, useData } from "@/lib/seiri/store";
import { formatDate, formatTime } from "@/lib/seiri/select";
import { slotKey, type Slot } from "@/lib/seiri/slots";

/** The platforms the original's videoconference field offers. */
const PROVIDERS = [
  { value: "meet", label: "Google Meet" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "zoom", label: "Zoom" },
  { value: "other", label: "Outro" },
];

const day = (iso: string) => iso.slice(0, 10);

/** The agenda and date line the slot modals repeat under their title. */
function SlotHeader({ slot, withTime = true }: { slot: Slot; withTime?: boolean }) {
  const data = useData();
  const agenda = data.agendas.find((a) => a.id === slot.agendaId);
  return (
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
      <CalendarIcon className="w-6 h-6 text-accent" />
      <div className="min-w-0">
        <h3 className="text-base font-bold text-gray-900 alatsi-regular truncate">{agenda?.name ?? "—"}</h3>
        <p className="text-sm text-gray-600 lato-regular flex items-center gap-1.5 mt-0.5">
          <ClockIcon className="w-3.5 h-3.5" />
          {formatDate(slot.start)}
          {withTime ? ` ${formatTime(slot.start)}` : ""}
        </p>
      </div>
    </div>
  );
}

/** "Bloquear Horário": the single-slot version of the toolbar's block. */
export function SlotBlockModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const [reason, setReason] = useState("");

  const save = () => {
    update((d) => ({
      ...d,
      blocks: [
        ...d.blocks,
        {
          id: nextId("bl", d.blocks),
          agendaIds: [slot.agendaId],
          from: day(slot.start),
          to: day(slot.start),
          startTime: formatTime(slot.start),
          endTime: formatTime(slot.end),
          reason: reason.trim(),
        },
      ],
    }));
    onClose();
  };

  return (
    <Modal
      id="calendar-block-modal"
      title="Bloquear Horário"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--danger" onClick={save}>
            <LockIcon width={16} height={16} />
            Bloquear
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600 lato-regular">Novos agendamentos não poderão ser feitos neste horário.</p>
      <div className="hinput-field hinput-field--block mt-4">
        <label className="hinput-label" htmlFor="motivo">
          Motivo do bloqueio
        </label>
        <div className="hinput-wrap">
          <input
            id="motivo"
            name="motivo"
            className="hinput"
            type="text"
            placeholder="Escreva o motivo do bloqueio"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/** "Editar Horário": the slot's own start, end and capacity. */
export function SlotEditModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const [start, setStart] = useState(formatTime(slot.start));
  const [end, setEnd] = useState(formatTime(slot.end));
  const [max, setMax] = useState(String(slot.max));

  const save = () => {
    update((d) => ({
      ...d,
      slotInfo: { ...d.slotInfo, [slotKey(slot.agendaId, slot.start)]: { ...slot.info, start, end, max: max ? Number(max) : null } },
    }));
    onClose();
  };

  return (
    <Modal
      id="calendar-slot-edit-modal"
      title="Editar Horário"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            Salvar
          </button>
        </>
      }
    >
      <SlotHeader slot={slot} withTime={false} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="start_time">
            Horário de Início<span className="hinput-req">*</span>
          </label>
          <div className="mt-1.5">
            <TimePicker id="start_time" name="start_time" ariaLabel="Horário de Início" value={start} onChange={setStart} />
          </div>
        </div>
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="end_time">
            Horário de Fim<span className="hinput-req">*</span>
          </label>
          <div className="mt-1.5">
            <TimePicker id="end_time" name="end_time" ariaLabel="Horário de Fim" value={end} onChange={setEnd} />
          </div>
        </div>
      </div>
      <div className="hinput-field hinput-field--block mt-4">
        <label className="hinput-label" htmlFor="max_number_people">
          Número máximo de agendamentos no horário
        </label>
        <div className="hinput-wrap">
          <input
            id="max_number_people"
            name="max_number_people"
            className="hinput"
            type="number"
            min={1}
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/** "Videoconferência": the meeting link the slot carries. */
export function SlotVideoModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const [provider, setProvider] = useState(slot.info.videoProvider ?? "");
  const [url, setUrl] = useState(slot.info.videoUrl ?? "");

  const save = () => {
    update((d) => ({
      ...d,
      slotInfo: { ...d.slotInfo, [slotKey(slot.agendaId, slot.start)]: { ...slot.info, videoProvider: provider, videoUrl: url.trim() } },
    }));
    onClose();
  };

  return (
    <Modal
      id="calendar-slot-video-modal"
      title="Videoconferência"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            Salvar
          </button>
        </>
      }
    >
      <SlotHeader slot={slot} />
      <div className="space-y-4">
        <Combobox
          id="id_slot_video_provider"
          label="Plataforma de Videoconferência"
          options={PROVIDERS}
          value={provider}
          onChange={setProvider}
          placeholder="Selecione a plataforma"
        />
        <div className="hinput-field hinput-field--block">
          <label className="hinput-label" htmlFor="url_video">
            Link da Videoconferência
          </label>
          <div className="hinput-wrap">
            <input id="url_video" name="url_video" className="hinput" type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** "Editar Comentário" on one appointment. */
export function CommentModal({ appointmentId, onClose }: { appointmentId: string; onClose: () => void }) {
  const data = useData();
  const [text, setText] = useState(data.appointments.find((a) => a.id === appointmentId)?.comment ?? "");

  const save = () => {
    update((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === appointmentId ? { ...a, comment: text.trim() } : a)) }));
    onClose();
  };

  return (
    <Modal
      id="appt-comment-modal"
      title="Editar Comentário"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            Salvar
          </button>
        </>
      }
    >
      <div className="hinput-field hinput-field--block">
        <label className="hinput-label" htmlFor="client_text">
          Comentários
        </label>
        <div className="hinput-wrap">
          <textarea
            id="client_text"
            name="client_text"
            className="htextarea"
            rows={4}
            placeholder="Digite um comentário sobre o agendamento"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/** "Editar Tags" on one appointment. */
export function TagsModal({ appointmentId, onClose }: { appointmentId: string; onClose: () => void }) {
  const data = useData();
  const [tagIds, setTagIds] = useState(data.appointments.find((a) => a.id === appointmentId)?.tagIds ?? []);

  const save = () => {
    update((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === appointmentId ? { ...a, tagIds } : a)) }));
    onClose();
  };

  return (
    <Modal
      id="appt-tags-modal"
      title="Editar Tags"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={save}>
            Salvar
          </button>
        </>
      }
    >
      <ChipMultiSelect
        id="tags"
        label="Tags"
        placeholder="Selecione as tags"
        options={data.tags.map((t) => ({ id: t.id, label: t.name }))}
        values={tagIds}
        onChange={setTagIds}
      />
    </Modal>
  );
}
