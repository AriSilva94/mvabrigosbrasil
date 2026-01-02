import type { JSX } from "react";

import type { Report } from "@/constants/reports";

import ReportCard from "./ReportCard";

type ReportsSectionProps = {
  reports: ReadonlyArray<Report>;
};

export default function ReportsSection({
  reports,
}: ReportsSectionProps): JSX.Element | null {
  if (reports.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="reports-title">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="reports-title" className="font-30 font-semibold text-brand-secondary">
            Relatórios Disponíveis
          </h2>
        </div>

        <div className="mt-10 space-y-6">
          {reports.map((report) => (
            <ReportCard
              key={report.slug}
              title={report.title}
              description={report.description}
              image={report.image}
              href={`/relatorios/${report.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
