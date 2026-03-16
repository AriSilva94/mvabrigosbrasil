import type { JSX } from "react";
import Link from "next/link";

type TrainingBannerProps = {
  href: string;
  disabled?: boolean;
};

export default function TrainingBanner({
  href,
  disabled = false,
}: TrainingBannerProps): JSX.Element {
  return (
    <article
      id="tour-training-banner"
      className="flex flex-col gap-3 rounded-xl border border-[#f2e5b9] bg-[#fff7d5] px-5 py-4 text-[#6f6133] shadow-sm md:flex-row md:items-center md:justify-between"
      role="alert"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold">
          Novo por aqui?{" "}
          <span className="font-normal">Veja como funciona a plataforma.</span>
        </p>
      </div>

      {disabled ? (
        <span className="inline-flex w-full cursor-not-allowed justify-center rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 md:w-auto">
          Treinamento indisponível
        </span>
      ) : (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sample inline-flex w-full justify-center bg-brand-primary px-4 py-2 text-sm font-semibold md:w-auto"
        >
          Assistir Treinamento
        </Link>
      )}
    </article>
  );
}
