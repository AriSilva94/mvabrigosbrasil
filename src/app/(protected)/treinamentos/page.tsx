import type { JSX } from "react";
import { Play } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { Heading, Text } from "@/components/ui/typography";
import AppImage from "@/components/ui/AppImage";
import { TRAINING_VIDEOS } from "@/constants/trainings";
import type { TrainingVideo } from "@/types/training.types";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Treinamentos",
  description:
    "Vídeos e materiais de capacitação para equipes de abrigos e voluntários cadastrados na plataforma.",
  canonical: "/treinamentos",
});

function TrainingCard({ video }: { video: TrainingVideo }): JSX.Element {
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/0.jpg`;

  return (
    <li>
      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        className="group block h-full focus:outline-none"
        aria-label={`Assistir ${video.title} no YouTube`}
      >
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_40px_rgba(16,130,89,0.06)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_20px_55px_rgba(16,130,89,0.12)] group-focus-visible:-translate-y-1 group-focus-visible:shadow-[0_20px_55px_rgba(16,130,89,0.12)]">
          <div className="relative aspect-video overflow-hidden bg-slate-100">
            <AppImage
              src={thumbnailUrl}
              alt={`Capa do treinamento ${video.title}`}
              width={480}
              height={270}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-primary shadow-sm ring-1 ring-black/5 backdrop-blur">
              <Play className="h-4 w-4" aria-hidden />
              Assistir
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2 px-5 py-4">
            <Heading
              as="h3"
              className="text-lg font-semibold text-brand-secondary"
            >
              {video.title}
            </Heading>
            <Text className="text-sm leading-relaxed text-[#68707b]">
              {video.description}
            </Text>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
              Assistir no YouTube
              <span aria-hidden>→</span>
            </span>
          </div>
        </article>
      </a>
    </li>
  );
}

export default async function Page(): Promise<JSX.Element> {
  return (
    <main>
      <PageHeader
        title="Treinamentos"
        breadcrumbs={[
          { label: "Inicial", href: "/" },
          { label: "Painel", href: "/painel" },
          { label: "Treinamentos" },
        ]}
      />

      <section
        className="bg-white pb-16 pt-8"
        aria-labelledby="training-section-title"
      >
        <div className="container px-6">
          <header className="mx-auto max-w-3xl text-center">
            <Heading
              as="h2"
              id="training-section-title"
              className="text-[22px] font-semibold text-brand-secondary md:text-[26px]"
            >
              Capacitações em vídeo
            </Heading>
            <Text className="mt-3 text-base leading-relaxed text-[#68707b]">
              Conteúdos introdutórios para apoiar equipes e voluntários na
              rotina dos abrigos. Assista às aulas abaixo no YouTube.
            </Text>
          </header>

          <ul
            className="mt-10 grid gap-6 md:grid-cols-2"
            aria-label="Lista de treinamentos"
          >
            {TRAINING_VIDEOS.map((video) => (
              <TrainingCard key={video.id} video={video} />
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
