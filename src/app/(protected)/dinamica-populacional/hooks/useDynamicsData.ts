import { useCallback, useEffect, useState } from "react";

import type {
  DynamicType,
  DynamicsDisplay,
  PopulationUserSummary,
  RegisterFormValues,
  RegisterFormSubmit,
  RateCardData,
} from "../types";
import { BASE_STATS } from "../ui/constants";

type UseDynamicsDataParams = {
  userSummary: PopulationUserSummary | null;
  shelterWpPostId?: number | null;
};

type UseDynamicsDataReturn = {
  sections: DynamicsDisplay[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isRegisterChoiceOpen: boolean;
  openRegisterChoice: () => void;
  closeRegisterChoice: () => void;
  openRegister: (type: DynamicType) => void;
  closeRegister: () => void;
  registerType: DynamicType | null;
  formInitialValues?: RegisterFormValues | null;
  editingRowId?: string | null;
  isEditing: boolean;
  startEditRow: (type: DynamicType, rowId: string) => void;
  onSubmit: (payload: RegisterFormSubmit) => Promise<void>;
  onDelete: () => Promise<void>;
};

const buildFallbackSections = (
  userSummary: PopulationUserSummary | null,
  baseStats: RateCardData[],
): DynamicsDisplay[] => [
  {
    dynamicType: "dinamica",
    title: "Dinâmica Populacional",
    populationInitial: userSummary?.totalAnimals ?? null,
    populationInitialDogs: userSummary?.dogsCount ?? null,
    populationInitialCats: userSummary?.catsCount ?? null,
    populationCurrent: userSummary?.totalAnimals ?? null,
    populationCurrentDogs: userSummary?.dogsCount ?? null,
    populationCurrentCats: userSummary?.catsCount ?? null,
    stats: [...baseStats],
    rows: [],
  },
  {
    dynamicType: "dinamica_lar",
    title: "Dinâmica Populacional L.T",
    populationInitial: userSummary?.totalAnimals ?? null,
    populationInitialDogs: userSummary?.dogsCount ?? null,
    populationInitialCats: userSummary?.catsCount ?? null,
    populationCurrent: userSummary?.totalAnimals ?? null,
    populationCurrentDogs: userSummary?.dogsCount ?? null,
    populationCurrentCats: userSummary?.catsCount ?? null,
    stats: [...baseStats],
    rows: [],
  },
];

export function useDynamicsData({
  userSummary,
  shelterWpPostId,
}: UseDynamicsDataParams): UseDynamicsDataReturn {
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isRegisterChoiceOpen, setRegisterChoiceOpen] = useState(false);
  const [registerType, setRegisterType] = useState<DynamicType | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<RegisterFormValues | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [sections, setSections] = useState<DynamicsDisplay[]>(() =>
    buildFallbackSections(userSummary, BASE_STATS),
  );

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      // Construir URL com query parameter se shelterWpPostId foi fornecido
      const url = shelterWpPostId
        ? `/api/dynamics?shelter_id=${shelterWpPostId}`
        : "/api/dynamics";

      const response = await fetch(url);
      if (!response.ok) {
        setSections(buildFallbackSections(userSummary, BASE_STATS));
        return;
      }
      const json = (await response.json()) as { sections?: DynamicsDisplay[] };
      const nextSections =
        json.sections && json.sections.length > 0
          ? json.sections
          : buildFallbackSections(userSummary, BASE_STATS);
      setSections(nextSections);
    } catch (error) {
      console.error("dinamica-populacional: falha ao carregar dados", error);
      setSections(buildFallbackSections(userSummary, BASE_STATS));
    } finally {
      setLoading(false);
    }
  }, [userSummary, shelterWpPostId]);

  useEffect(() => {
    void fetchSections();
  }, [fetchSections]);

  const handleSubmit = useCallback(
    async (values: RegisterFormSubmit) => {
      setSaving(true);
      try {
        const response = await fetch("/api/dynamics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          console.error("Erro ao salvar registro de dinâmica");
        } else {
          const json = (await response.json()) as { sections?: DynamicsDisplay[] };
          const nextSections =
            json.sections && json.sections.length > 0
              ? json.sections
              : buildFallbackSections(userSummary, BASE_STATS);
          setSections(nextSections);
        }
      } catch (error) {
        console.error("dinamica-populacional: falha ao salvar registro", error);
      } finally {
        setSaving(false);
        setRegisterType(null);
        setEditingRowId(null);
        setFormInitialValues(null);
      }
    },
    [userSummary],
  );

  const openRegisterChoice = (): void => setRegisterChoiceOpen(true);
  const closeRegisterChoice = (): void => setRegisterChoiceOpen(false);
  const openRegister = (type: DynamicType): void => {
    closeRegisterChoice();
    setEditingRowId(null);
    setFormInitialValues(null);
    setRegisterType(type);
  };
  const closeRegister = (): void => {
    setRegisterType(null);
    setEditingRowId(null);
    setFormInitialValues(null);
  };

  const startEditRow = (type: DynamicType, rowId: string): void => {
    const section = sections.find((sectionItem) => sectionItem.dynamicType === type);
    const row = section?.rows.find((item) => item.id === rowId);
    if (!row) {
      openRegister(type);
      return;
    }

    setEditingRowId(row.id);
    const dateSource = row.referenceDate || row.referenceLabel;
    const [month, year] = dateSource.includes("/")
      ? dateSource.split("/").reverse()
      : dateSource.split("-").length >= 2
        ? [dateSource.split("-")[1], dateSource.split("-")[0]]
        : ["01", "2025"];

    setFormInitialValues({
      month: month.padStart(2, "0"),
      year,
      entries: String(row.metrics.entriesDogs ?? 0),
      entriesCats: String(row.metrics.entriesCats ?? 0),
      adoptions: String(row.metrics.adoptionsDogs ?? 0),
      adoptionsCats: String(row.metrics.adoptionsCats ?? 0),
      returns: String(row.metrics.returnsDogs ?? 0),
      returnsCats: String(row.metrics.returnsCats ?? 0),
      euthanasias: String(row.metrics.euthanasiasDogs ?? 0),
      euthanasiasCats: String(row.metrics.euthanasiasCats ?? 0),
      naturalDeaths: String(row.metrics.naturalDeathsDogs ?? 0),
      naturalDeathsCats: String(row.metrics.naturalDeathsCats ?? 0),
      diseases: String(row.metrics.diseasesDogs ?? 0),
      diseasesCats: String(row.metrics.diseasesCats ?? 0),
      tutorReturn: String(row.metrics.tutorReturnDogs ?? 0),
      tutorReturnCats: String(row.metrics.tutorReturnCats ?? 0),
      originReturn: String(row.metrics.originReturnDogs ?? 0),
      originReturnCats: String(row.metrics.originReturnCats ?? 0),
    });
    setRegisterType(type);
  };

  const handleDelete = useCallback(async () => {
    if (!editingRowId) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/dynamics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRowId }),
      });

      if (!response.ok) {
        console.error("Erro ao excluir registro de dinâmica");
        return;
      }

      const json = (await response.json()) as { sections?: DynamicsDisplay[] };
      const nextSections =
        json.sections && json.sections.length > 0
          ? json.sections
          : buildFallbackSections(userSummary, BASE_STATS);
      setSections(nextSections);
    } catch (error) {
      console.error("dinamica-populacional: falha ao excluir registro", error);
    } finally {
      setDeleting(false);
      setRegisterType(null);
      setFormInitialValues(null);
      setEditingRowId(null);
    }
  }, [editingRowId, userSummary]);

  return {
    sections,
    isLoading,
    isSaving,
    isDeleting,
    isRegisterChoiceOpen,
    openRegisterChoice,
    closeRegisterChoice,
    openRegister,
    closeRegister,
    registerType,
    formInitialValues,
    editingRowId,
    isEditing: Boolean(formInitialValues && editingRowId),
    startEditRow,
    onSubmit: handleSubmit,
    onDelete: handleDelete,
  };
}
