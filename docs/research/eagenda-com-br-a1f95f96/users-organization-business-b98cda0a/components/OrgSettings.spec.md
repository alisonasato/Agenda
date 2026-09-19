# OrgSettings

`src/components/sites/eagenda-com-br-a1f95f96/users-organization-business-b98cda0a/OrgSettings.tsx`

- **OrgSettings:** `step` state; a `reload` key remounts the panel on every click.
- **Steps:** one component per step, `BusinessStep` … `DataStep`. Each wraps its own `StepForm`, which holds the alerts slot, `cfg-content` and a `SaveBar` (or a custom dock).
- **Local parts:** `Group`, `Check`, `Opt`, `Field` (optional mask), `NumberField` (hinput stepper), `Alert`.
- **New shared:** `Select` (hselect-field); icons `UndoIcon`, `TrashIcon`, `DangerCircleIcon`.
