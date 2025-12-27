"use client";

import type { FormEvent, JSX } from "react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { FormLoading } from "@/components/loading/FormLoading";
import {
  shelterProfileSchema,
  type ShelterProfileInput,
} from "@/modules/shelter/shelterProfileSchema";
import { useShelterProfile } from "@/hooks/useShelterProfile";
import { usePopulationEditScroll } from "@/hooks/usePopulationEditScroll";
import type { ShelterProfileFormData } from "@/types/shelter.types";
import ShelterAuthorizationSection from "./ShelterAuthorizationSection";
import ShelterInfoSection from "./ShelterInfoSection";
import { DeactivateDialog } from "./DeactivateDialog";
import { AlertCircle } from "lucide-react";
import { buildPopulationPayload } from "@/modules/shelter/populationEditHelpers";

export default function ShelterProfileForm({
  populationEditOnly = false,
}: {
  populationEditOnly?: boolean;
}): JSX.Element {
  const router = useRouter();
  const { shelter, isLoading, refresh } = useShelterProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ShelterProfileInput, string>>
  >({});
  const [shelterType, setShelterType] = useState<string>(
    shelter?.shelterType ?? ""
  );
  const [documentValue, setDocumentValue] = useState<string>(
    shelter?.cnpj ?? ""
  );
  const [addressData, setAddressData] = useState({
    street: shelter?.street ?? "",
    district: shelter?.district ?? "",
    city: shelter?.city ?? "",
    state: shelter?.state ?? "",
  });
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  usePopulationEditScroll(populationEditOnly && !isLoading);

  useEffect(() => {
    setShelterType(shelter?.shelterType ?? "");
    setDocumentValue(shelter?.cnpj ?? "");
    setAddressData({
      street: shelter?.street ?? "",
      district: shelter?.district ?? "",
      city: shelter?.city ?? "",
      state: shelter?.state ?? "",
    });
  }, [shelter]);

  function handleCepAutocomplete(data: {
    street: string;
    district: string;
    city: string;
    state: string;
  }) {
    setAddressData(data);
  }

  async function handleDeactivate() {
    try {
      const response = await fetch("/api/shelter-profile/deactivate", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Não foi possível alterar o status do cadastro."
        );
      }

      toast.success(result.message);
      await refresh();
    } catch (error) {
      console.error("Erro ao alterar status do cadastro", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do cadastro.";
      toast.error(message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const foundationDateRaw = String(formData.get("foundationDate") ?? "");

    // Normaliza data para ISO (yyyy-MM-dd) antes de validar/salvar.
    const foundationDateIso =
      foundationDateRaw && foundationDateRaw.includes("/")
        ? foundationDateRaw.split("/").reverse().join("-")
        : foundationDateRaw;

    const temporaryAgreementValue = formData.get("temporaryAgreement");
    const payload = populationEditOnly
      ? buildPopulationPayload(shelter, formData)
      : {
          shelterType: shelterType || String(formData.get("shelterType") ?? ""),
          cnpj: documentValue || String(formData.get("cnpj") ?? ""),
          shelterName: String(formData.get("shelterName") ?? ""),
          cep: String(formData.get("cep") ?? ""),
          street: String(formData.get("street") ?? ""),
          number: formData.get("number"),
          district: String(formData.get("district") ?? ""),
          state: String(formData.get("state") ?? ""),
          city: String(formData.get("city") ?? ""),
          website: String(formData.get("website") ?? ""),
          foundationDate: foundationDateIso,
          species: String(formData.get("species") ?? ""),
          additionalSpecies: formData.getAll("additionalSpecies").map(String),
          temporaryAgreement: temporaryAgreementValue
            ? String(temporaryAgreementValue)
            : undefined,
          initialDogs: formData.get("initialDogs"),
          initialCats: formData.get("initialCats"),
          authorizedName: String(formData.get("authorizedName") ?? ""),
          authorizedRole: String(formData.get("authorizedRole") ?? ""),
          authorizedEmail: String(formData.get("authorizedEmail") ?? ""),
          authorizedPhone: String(formData.get("authorizedPhone") ?? ""),
          acceptTerms: formData.get("acceptTerms") === "on",
        };

    const parsed = shelterProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const issues: Partial<Record<keyof ShelterProfileInput, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          issues[path as keyof ShelterProfileInput] = issue.message;
        }
      });
      setFieldErrors(issues);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      const response = await fetch("/api/shelter-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível salvar o cadastro.");
      }

      toast.success("Cadastro do abrigo salvo com sucesso.");
      if (populationEditOnly) {
        router.push("/dinamica-populacional");
        return;
      }
      await refresh();
    } catch (error) {
      console.error("Erro ao salvar cadastro do abrigo", error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o cadastro.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formKey = useMemo(
    () => (shelter ? JSON.stringify(shelter) : "empty"),
    [shelter]
  );

  const addressOverrides = Object.fromEntries(
    Object.entries(addressData).filter(([, value]) => value !== "")
  );

  const data: Partial<ShelterProfileFormData> | null = shelter
    ? { ...shelter, ...addressOverrides }
    : null;

  const submitLabel = isLoading
    ? "Carregando..."
    : isSubmitting
    ? "Salvando..."
    : "Salvar Cadastro";

  if (isLoading && !shelter) {
    return <FormLoading />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      key={formKey}
      className="mx-auto flex max-w-6xl flex-col gap-10 rounded-2xl bg-white px-6 py-10 shadow-[0_18px_50px_rgba(16,130,89,0.08)] md:px-10"
    >
      {shelter?.active === false && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <strong className="font-semibold">Cadastro Inativo</strong>
            <p className="mt-0.5 text-amber-700">
              Este cadastro está inativo e não aparece nas buscas públicas. Para
              reativá-lo, clique em &quot;Reativar Cadastro&quot; abaixo.
            </p>
          </div>
        </div>
      )}

      <ShelterInfoSection
        data={data}
        fieldErrors={fieldErrors}
        shelterType={shelterType}
        onShelterTypeChange={(value) => {
          setShelterType(value);
          setDocumentValue("");
          setFieldErrors((prev) => ({
            ...prev,
            shelterType: undefined,
            cnpj: undefined,
          }));
        }}
        documentValue={documentValue}
        onDocumentValueChange={(value) => {
          setDocumentValue(value);
          setFieldErrors((prev) => ({ ...prev, cnpj: undefined }));
        }}
        onCepAutocomplete={handleCepAutocomplete}
        lockNonPopulation={populationEditOnly}
      />

      <ShelterAuthorizationSection
        data={data}
        fieldErrors={fieldErrors}
        lockNonPopulation={populationEditOnly}
      />

      <div className="flex flex-col items-center gap-4 pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-brand-primary px-10 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(16,130,89,0.2)] transition hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
          disabled={isSubmitting || isLoading}
        >
          {submitLabel}
        </button>
        {shelter && (
          <button
            type="button"
            onClick={() => setIsDeactivateDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            disabled={isSubmitting || isLoading || populationEditOnly}
          >
            {shelter.active === false
              ? "Reativar Cadastro"
              : "Inativar Cadastro"}
          </button>
        )}
      </div>

      {shelter && (
        <DeactivateDialog
          open={isDeactivateDialogOpen}
          onOpenChange={setIsDeactivateDialogOpen}
          onConfirm={handleDeactivate}
          isActive={shelter.active !== false}
        />
      )}
    </form>
  );
}
