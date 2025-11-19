"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const MapChart = dynamic(() => import("./MapChart"), { ssr: false });

export default function MapSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <header className="text-center">
          <h2 className="font-600 font-34 text-brand-primary">
            Confira o Mapeamento <br /> de Abrigos pelo Brasil
          </h2>
        </header>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-light p-4 shadow-sm">
          <MapChart />
        </div>

        <div className="mt-12 rounded-2xl bg-light p-6 shadow-sm">
          <div className="text-center text-color-secondary">
            <p className="text-base md:text-lg">
              O Projeto está em seu desenvolvimento inicial, dessa maneira, o
              banco de dados e mapeamento está ainda com poucas informações.
              Ajude esse movimento a crescer, faça parte dele registrando os
              dados do seu abrigo/lar temporário!!
            </p>
          </div>

          <div className="my-6 border-t border-slate-200" />

          <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="color-primary font-24 font-600 leading-tight">
                Nosso Banco <br /> de Dados
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-5 md:gap-8">
              <div>
                <h3 className="font-600 font-45 color-primary leading-none">
                  288
                </h3>
                <span className="font-20 font-600 color-primary">Abrigos</span>
              </div>
              <div>
                <h3 className="font-600 font-45 leading-none text-color-secondary">
                  29
                </h3>
                <span className="font-20 font-600 text-color-secondary">
                  Públicos
                </span>
              </div>
              <div>
                <h3 className="font-600 font-45 leading-none text-color-secondary">
                  185
                </h3>
                <span className="font-20 font-600 text-color-secondary">
                  Privados
                </span>
              </div>
              <div>
                <h3 className="font-600 font-45 leading-none text-color-secondary">
                  16
                </h3>
                <span className="font-20 font-600 text-color-secondary">
                  Mistos
                </span>
              </div>
              <div>
                <h3 className="font-600 font-45 leading-none text-color-secondary">
                  58
                </h3>
                <span className="font-20 font-600 text-color-secondary">
                  LT/P.I
                </span>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Link className="btn-sample" href="/banco-de-dados">
                Acessar Banco
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
