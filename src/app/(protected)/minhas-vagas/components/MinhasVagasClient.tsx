"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Heading, Text } from "@/components/ui/typography";
import type { UiVacancy } from "@/app/(protected)/minhas-vagas/types";
import NewVacancyModal from "@/app/(protected)/minhas-vagas/components/NewVacancyModal";
import VacancyCard from "@/app/(protected)/minhas-vagas/components/VacancyCard";

type MinhasVagasClientProps = {
  vacancies: UiVacancy[];
  shelterName: string | null;
};

export default function MinhasVagasClient({
  vacancies,
  shelterName,
}: MinhasVagasClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<UiVacancy[]>(vacancies);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasShelterName = useMemo(
    () => Boolean(shelterName?.trim()),
    [shelterName]
  );

  useEffect(() => {
    setItems(vacancies);
  }, [vacancies]);

  async function refreshVacancies() {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/vacancies", { cache: "no-store" });
      if (!response.ok) throw new Error("Erro ao carregar vagas");
      const json = (await response.json()) as { vacancies?: UiVacancy[] };
      if (json.vacancies) setItems(json.vacancies);
    } catch (error) {
      console.error("refreshVacancies: erro ao buscar vagas", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleCreated(vacancy: UiVacancy) {
    setItems((prev) => [vacancy, ...prev]);
    setIsModalOpen(false);
  }

  function handleDeleted(vacancyId: string) {
    setItems((prev) => prev.filter((v) => v.id !== vacancyId));
  }

  return (
    <div className="container px-6 py-12 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Heading
            as="h2"
            className="text-xl font-semibold text-brand-secondary"
          >
            Vagas do abrigo
          </Heading>
          <Text className="text-sm text-[#68707b]">
            {hasShelterName
              ? `Exibindo oportunidades vinculadas ao abrigo "${shelterName}".`
              : "Complete o cadastro do abrigo para localizar e vincular suas vagas."}
          </Text>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
          >
            Nova Vaga
          </button>
          <Link
            href="/meu-cadastro"
            className="inline-flex items-center rounded-full bg-[#f5f5f6] px-4 py-2 text-xs font-semibold text-brand-secondary transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,130,89,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary"
          >
            Atualizar cadastro
          </Link>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_30px_rgba(16,130,89,0.06)]">
          <Text className="text-base font-semibold text-brand-secondary">
            Você ainda não possui nenhuma vaga disponível
          </Text>
          <Text className="mt-2 text-sm text-[#68707b]">
            {hasShelterName
              ? "Clique em “Nova Vaga” para publicar uma oportunidade."
              : "Informe o nome do abrigo no cadastro para publicar e vincular vagas."}
          </Text>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
            >
              Nova Vaga
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((vacancy) => (
            <li key={vacancy.id}>
              <VacancyCard
                vacancy={vacancy}
                showEditLink
                editHref={`/minhas-vagas/editar/${vacancy.slug || vacancy.id}`}
                onDeleted={() => handleDeleted(vacancy.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <NewVacancyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shelterName={shelterName}
        onCreated={handleCreated}
        onRefresh={refreshVacancies}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
