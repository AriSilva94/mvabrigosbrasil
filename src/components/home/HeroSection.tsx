import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="intro relative isolate overflow-hidden bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.55)_100%)]">
      <Image
        src="/assets/img/bg_intro.jpg"
        alt="Plano de fundo de animais"
        fill
        priority
        className="-z-10 object-cover"
      />
      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-6xl flex-col items-center justify-center px-6 text-center text-white md:px-8">
        <h1 className="font-600 font-45 text-white md:max-w-11/12">
          Mapeamento e Banco de Dados de Abrigos de Animais no Brasil
        </h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg">
          Os registros dos dados também ajudam a salvar vidas! <br /> Faça parte
          desse movimento
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 md:flex-row">
          <Link
            className="btn-sample-lg bg-secondary"
            href="/register?tipo=voluntario"
          >
            Cadastro Voluntário
          </Link>
          <Link className="btn-sample-lg" href="/register?tipo=abrigo">
            Cadastro Abrigo
          </Link>
        </div>
      </div>
    </section>
  );
}
