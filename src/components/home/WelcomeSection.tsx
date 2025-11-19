import Image from "next/image";
import Link from "next/link";
import { BarChart3, Home, UserCheck2 } from "lucide-react";

export default function WelcomeSection() {
  return (
    <section className="bg-light py-16 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center md:gap-12">
        <article className="md:w-1/2 space-y-4 text-color-secondary">
          <p className="font-600 font-20 uppercase text-brand-accent tracking-[0.03em]">
            Boas Vindas
          </p>
          <h2 className="font-600 font-36 text-brand-primary">
            1ª iniciativa de mapeamento e coleta de dados dos abrigos de cães e
            gatos do Brasil
          </h2>
          <p>
            A Medicina de Abrigos Brasil - Infodados de Abrigos de Animais é uma
            iniciativa para promover a ciência da medicina de abrigos no Brasil
            e ser um banco de dados nacional centralizado e padronizado para
            estatísticas de abrigos de animais.
          </p>
          <p>
            Dados representativos com base em estatísticas nacionais para o
            desenvolvimento de políticas públicas podem reduzir o abandono de
            animais de estimação e promover a adoção.
          </p>
          <p>
            Venha fazer parte desse movimento, se você é um abrigo/lar
            temporário colabore com o registro desses números, eles podem salvar
            e melhorar a vida dos animais!
          </p>

          <ul className="mt-6 flex flex-wrap items-center gap-5 text-brand-primary">
            <li className="flex items-center gap-2">
              <Home size={18} />
              <Link className="color-primary" href="/quem-somos">
                Quem Somos
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <BarChart3 size={18} />
              <Link className="color-primary" href="/banco-de-dados">
                Banco de Dados
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <UserCheck2 size={18} />
              <Link className="color-primary" href="/login">
                Entrar/Cadastrar
              </Link>
            </li>
          </ul>
        </article>

        <div className="md:w-1/2">
          <Link
            href="/quem-somos"
            className="block overflow-hidden rounded-2xl shadow-lg"
          >
            <Image
              src="/assets/img/sobre-mvabrigos.png"
              alt="Profissional cuidando de cachorro em abrigo"
              width={640}
              height={720}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
