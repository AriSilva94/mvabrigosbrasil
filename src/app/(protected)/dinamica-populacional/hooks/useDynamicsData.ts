import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteDynamics,
  getDynamics,
  isCurrentDynamicsRequest,
  saveDynamics,
} from "@/modules/dynamics/dynamicsApi";

import type {
  DynamicType,
  DynamicsDisplay,
  PopulationUserSummary,
  RegisterFormValues,
  RegisterFormSubmit,
  RateCardData,
} from "../types";
import { BASE_STATS } from "../ui/constants";
import { parseRowPeriod } from "../utils/parseRowPeriod";

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
    populationInitial: userSummary?.totalAnimalsLt ?? null,
    populationInitialDogs: userSummary?.dogsCountLt ?? null,
    populationInitialCats: userSummary?.catsCountLt ?? null,
    populationCurrent: userSummary?.totalAnimalsLt ?? null,
    populationCurrentDogs: userSummary?.dogsCountLt ?? null,
    populationCurrentCats: userSummary?.catsCountLt ?? null,
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
  const dataRevision = useRef(0);
  const saveRevision = useRef(0);
  const deleteRevision = useRef(0);
  const [sections, setSections] = useState<DynamicsDisplay[]>(() =>
    buildFallbackSections(userSummary, BASE_STATS),
  );


  useEffect(() => {
    const controller = new AbortController();
    const revision = ++dataRevision.current;
    void (async () => {
      setLoading(true);
      try {
        const json = await getDynamics(shelterWpPostId, controller.signal);
        if (
          !isCurrentDynamicsRequest(
            revision,
            dataRevision.current,
            controller.signal.aborted,
          )
        ) {
          return;
        }
        const nextSections =
          json.sections.length > 0
            ? json.sections
            : buildFallbackSections(userSummary, BASE_STATS);
        setSections(nextSections);
      } catch (error) {
        if (
          !isCurrentDynamicsRequest(
            revision,
            dataRevision.current,
            controller.signal.aborted,
          )
        ) {
          return;
        }
        console.error("dinamica-populacional: falha ao carregar dados", error);
        setSections(buildFallbackSections(userSummary, BASE_STATS));
      } finally {
        if (
          isCurrentDynamicsRequest(
            revision,
            dataRevision.current,
            controller.signal.aborted,
          )
        ) {
          setLoading(false);
        }
      }
    })();
    return () => {
      controller.abort();
      if (dataRevision.current === revision) dataRevision.current += 1;
    };
  }, [userSummary, shelterWpPostId]);

  const handleSubmit = useCallback(
    async (values: RegisterFormSubmit) => {
      const revision = ++dataRevision.current;
      const currentSave = ++saveRevision.current;
      setSaving(true);
      try {
        const json = await saveDynamics(values);
        if (!isCurrentDynamicsRequest(revision, dataRevision.current, false)) return;
        const nextSections = json.sections.length > 0
          ? json.sections
          : buildFallbackSections(userSummary, BASE_STATS);
        setSections(nextSections);
      } catch (error) {
        if (!isCurrentDynamicsRequest(revision, dataRevision.current, false)) return;
        console.error("dinamica-populacional: falha ao salvar registro", error);
      } finally {
        if (currentSave !== saveRevision.current) return;
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
    const { month, year } = parseRowPeriod(row);

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
    const revision = ++dataRevision.current;
    const currentDelete = ++deleteRevision.current;
    setDeleting(true);
    try {
      const json = await deleteDynamics(editingRowId);
      if (!isCurrentDynamicsRequest(revision, dataRevision.current, false)) return;
      const nextSections =
        json.sections.length > 0
          ? json.sections
          : buildFallbackSections(userSummary, BASE_STATS);
      setSections(nextSections);
    } catch (error) {
      if (!isCurrentDynamicsRequest(revision, dataRevision.current, false)) return;
      console.error("dinamica-populacional: falha ao excluir registro", error);
    } finally {
      if (currentDelete !== deleteRevision.current) return;
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
