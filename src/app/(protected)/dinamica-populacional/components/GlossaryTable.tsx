import type { JSX } from "react";

import type { GlossarySection } from "../types";

type GlossaryTableProps = {
  sections: GlossarySection[];
};

export default function GlossaryTable({ sections }: GlossaryTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 bg-slate-50 px-4 py-3 sm:grid-cols-5 sm:items-center sm:px-6">
        <p className="col-span-2 text-sm font-semibold text-slate-700">Termo</p>
        <p className="col-span-3 text-sm font-semibold text-slate-700">Definição</p>
      </div>

      <div className="divide-y divide-slate-200">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="bg-slate-100 px-4 py-3 sm:px-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                {section.title}
              </p>
            </div>
            <ul className="divide-y divide-slate-200">
              {section.entries.map((entry) => (
                <li
                  key={entry.term}
                  className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-5 sm:items-start sm:px-6"
                >
                  <p className="col-span-2 text-sm font-semibold text-slate-800">
                    {entry.term}
                  </p>
                  <p className="col-span-3 text-sm text-slate-700">{entry.definition}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
