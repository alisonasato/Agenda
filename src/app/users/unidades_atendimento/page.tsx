import type { Metadata } from "next";
import { DashboardShell } from "@/components/sites/eagenda-com-br-a1f95f96/shared/DashboardShell";
import { UnitForm } from "@/components/sites/eagenda-com-br-a1f95f96/users-unidades_atendimento-3be64c22/UnitForm";
import { UnitsList } from "@/components/sites/eagenda-com-br-a1f95f96/users-unidades_atendimento-3be64c22/UnitsList";

// Clone of https://eagenda.com.br/users/unidades_atendimento/?version=3 (an account with no units);
// ?action=create is the "Nova Unidade" form, on the same URL as in the original.
type Props = { searchParams: Promise<{ action?: string | string[] }> };
const isCreate = async (searchParams: Props["searchParams"]) => (await searchParams).action === "create";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: (await isCreate(searchParams)) ? "Nova Unidade - Seiri" : "Unidades de Atendimento - Seiri",
    icons: { icon: "/brand/favicon.png" },
  };
}

export default async function UnitsPage({ searchParams }: Props) {
  const create = await isCreate(searchParams);
  return (
    <DashboardShell title={create ? "Nova Unidade" : "Administrar Unidades"} email="contato@exemplo.com.br" active="Administrar Unidades">
      {create ? (
        <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
          <UnitForm />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1550px] px-4 py-8 sm:px-6 lg:px-10 min-w-0">
          <UnitsList />
        </div>
      )}
    </DashboardShell>
  );
}
