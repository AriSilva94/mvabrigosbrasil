"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type ShelterTypesModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ShelterTypesModal({
  open,
  onClose,
}: ShelterTypesModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      role={open ? "dialog" : undefined}
      aria-modal="true"
      aria-labelledby="shelter-types-title"
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-start justify-center px-4 py-10 backdrop-blur-sm transition-all duration-300 ${
        open
          ? "bg-black/50 opacity-100"
          : "pointer-events-none bg-black/40 opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 text-text-default transition-all duration-300 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <h2
            id="shelter-types-title"
            className="text-lg font-semibold text-text-default"
          >
            Tipos de abrigo
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5 text-text-default">
          <p>
            <strong>Abrigos Públicos</strong> são os estabelecimentos de
            propriedade da Administração Pública, personalizados como pessoa
            jurídica de direito público. Não possuem finalidade comercial ou
            lucrativa e se enquadram como entidades do primeiro setor
            (geralmente são vinculados ao CCZ/UVZ/Canil e Gatil Público).
          </p>
          <p>
            <strong>Abrigos Privados</strong> são os estabelecimentos
            personalizados como pessoas jurídicas de direito privado, cuja
            propriedade são entidades do terceiro setor. Não possuem finalidade
            comercial ou lucrativa. Aqui são compreendidas as Organizações
            Não-Governamentais – ONGs, Organizações da Sociedade Civil – OSC, as
            OSCIP – Organização da Sociedade Civil de Interesse Público e as OS
            – Organização Social.
          </p>
          <p>
            <strong>Abrigos Mistos</strong> são resultantes de parcerias
            contratuais entre os abrigos públicos e privados, e que não possuem
            finalidade comercial ou lucrativa.
          </p>
          <p>
            <strong>Os Protetores Independentes</strong> são pessoas físicas que
            não possuem finalidade comercial ou lucrativa e realizam o serviço
            voluntário de resgatar animais em situação de rua que estão em
            perigo, recuperá-los, e reintrouzi-los na sociedade por meio da
            adoção ou devolta aos locais resgatados. São responsáveis pela
            manutenção das estruturas permanentemente, podendo receber ou não
            ajuda de terceiros ou de órgãos públicos. Podem ser também
            denominados de <strong>Lares Temporários</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
