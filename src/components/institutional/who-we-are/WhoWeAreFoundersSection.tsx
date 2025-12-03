import type { ComponentType, JSX, SVGProps } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import PawsBackgroundSection from "@/components/ui/PawsBackgroundSection";
import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";
import { FOUNDERS } from "@/constants/founders";
import type { Founder, FounderSocialType } from "@/types/who-we-are.types";
import SocialIcon from "@/components/ui/SocialIcon";

const InstagramIcon = ({
  className,
  ...rest
}: Omit<SVGProps<SVGSVGElement>, "name">): JSX.Element => (
  <SocialIcon name="instagram" size={20} className={className} {...rest} />
);

const FOUNDER_SOCIAL_ICONS: Record<
  FounderSocialType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  instagram: InstagramIcon,
  lattes: GraduationCap,
};

function FounderSocialLinks({ socials }: Pick<Founder, "socials">) {
  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      {socials.map(({ type, href, label }) => {
        const Icon = FOUNDER_SOCIAL_ICONS[type];

        return (
          <Link
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </div>
  );
}

function FounderCard({
  name,
  role,
  description,
  image,
  alt,
  socials,
}: Founder) {
  return (
    <article className="flex flex-col rounded-4xl bg-white/5 p-6 text-center shadow-xl">
      <AppImage
        src={image}
        alt={alt}
        width={360}
        height={360}
        className="h-auto w-full rounded-[26px] border border-white/20 object-cover"
        sizes="(max-width: 768px) 100vw, 360px"
      />

      <div className="mt-6 flex flex-1 flex-col space-y-4">
        <Heading as="h3" className="font-24 text-white">
          {name}
        </Heading>
        <Text className="text-sm font-semibold text-white/90">{role}</Text>
        <Text className="text-sm leading-relaxed text-white/80">
          {description}
        </Text>
      </div>

      <FounderSocialLinks socials={socials} />
    </article>
  );
}

export default function WhoWeAreFoundersSection(): JSX.Element {
  return (
    <PawsBackgroundSection className="py-16 text-white md:py-24">
      <div className="container px-6">
        <div className="text-center">
          <Heading as="h2" className="font-28 text-white">
            Conheça os Idealizadores do Projeto
          </Heading>
          <Text className="mt-2 text-base text-white/80">
            Pesquisadores que lideram e inspiram a Medicina de Abrigos Brasil.
          </Text>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} {...founder} />
          ))}
        </div>
      </div>
    </PawsBackgroundSection>
  );
}
