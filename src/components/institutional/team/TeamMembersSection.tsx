import type { JSX } from "react";

import AppImage from "@/components/ui/AppImage";
import { Heading, Text } from "@/components/ui/typography";

type TeamMember = {
  name: string;
  role: string;
  description: string;
  image: string;
  alt: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Lucas Galdioli",
    role: "Fundador e Gerente",
    description:
      "Médico veterinário pela Universidade Federal do Paraná, com intercâmbio na Universidade de Buenos Aires. Possui residência em Medicina Veterinária do Coletivo, mestrado e doutorado em Ciências Veterinárias na UFPR, com pesquisa em Medicina de Abrigos. Vice-presidente do Instituto de Medicina Veterinária do Coletivo e gerente de projetos no Fórum Nacional de Proteção e Defesa Animal. Organizador e coautor do livro Medicina de Abrigos: princípios e diretrizes e cofundador da Iniciativa Medicina de Abrigos Brasil.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/lucas.jpg",
    alt: "Foto de Lucas Galdioli sorrindo",
  },
  {
    name: "Yasmin da Silva Gonçalves da Rocha",
    role: "Fundadora e Gerente",
    description:
      "Doutora e Mestra em Ciências Veterinárias pela Universidade Federal do Paraná e bacharela em Medicina Veterinária pela Universidade Federal do Vale do São Francisco, com graduação-sanduíche na Murdoch University pelo programa Ciência sem Fronteiras. Consultora Técnica do Instituto de Medicina Veterinária do Coletivo, atua desenvolvendo temas como Teoria do Elo e Medicina de Abrigos.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/yasminequipe.png",
    alt: "Foto de Yasmin da Silva Gonçalves da Rocha sorrindo",
  },
  {
    name: "Rita de Cassia Maria Garcia",
    role: "Cofundadora",
    description:
      "Docente do Departamento de Medicina Veterinária da UFPR, graduada em Medicina Veterinária pela USP, com mestrado e doutorado em Epidemiologia Experimental Aplicada ao Controle de Zoonoses (FMVZ/USP). Especialista em Saúde Pública, Bem-Estar Animal, Patologia Clínica, Homeopatia e Medicina de Abrigos pela University of Florida, com pós-doutorado na USP. Membro da diretoria do IMVC/ITEC e consultora para OIE, FAO e WSPA/WAP.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/rita.jpg",
    alt: "Foto de Rita de Cassia Maria Garcia sorrindo",
  },
  {
    name: "Bruna Mão Cheia",
    role: "Social Media",
    description:
      "Graduanda em Medicina Veterinária na Universidade Anhembi Morumbi. Presidente do grupo de estudos em COLETIVET e monitora no projeto de extensão “Controle de superpopulação de cães e gatos baseada na shelter medicine”. Voluntária nos Médicos-Veterinários de Rua, com experiência em campanhas educacionais e divulgação científica.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/v02.jpg",
    alt: "Foto de Bruna Mão Cheia sorrindo",
  },
  {
    name: "Adriel da Rocha",
    role: "Coleta e Tratamento de Dados",
    description:
      "Graduado em Comunicação Social com habilitação em Produção em Mídias Digitais e graduando em Sistemas para Internet. Atua com coleta, modelagem e análise dos dados utilizados pela Medicina de Abrigos Brasil.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/2025/06/adriel.jpg",
    alt: "Foto de Adriel da Rocha sorrindo",
  },
  {
    name: "Gabriel Santos",
    role: "Coleta e Tratamento de Dados",
    description:
      "Bacharel em Medicina Veterinária pelo Centro Universitário de Patos de Minas (UNIPAM). Foi coordenador do Grupo de Estudos de Animais Selvagens (GEAS - UNIPAM) e integra a Associação de Veterinários Veganos e Vegetarianos. Bolsista do projeto Medicina de Abrigos Brasil e pós-graduando em Ciência de Dados e Analytics pela PUC-Rio.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/v03.jpg",
    alt: "Foto de Gabriel Santos sorrindo",
  },
  {
    name: "Cadu (Carlos Pinotti)",
    role: "Voluntário",
    description:
      "Administrador e especialista em marketing com ampla experiência no setor público e no terceiro setor. Atuou por mais de uma década em uma OSC da causa animal, captando recursos e promovendo ações de impacto. Cofundador da Associação das Entidades Assistenciais do município e Coordenador de Relações Institucionais, segue atuando em prol da causa animal.",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/themes/mvabrigosbrasil/images/v04.jpg",
    alt: "Foto de Cadu Carlos Pinotti sorrindo",
  },
];

function TeamMemberCard({
  name,
  role,
  description,
  image,
  alt,
}: TeamMember): JSX.Element {
  return (
    <article className="flex flex-col gap-5 rounded-4x1 bg-white p-6 md:flex-row md:items-start">
      <AppImage
        src={image}
        alt={alt}
        width={120}
        height={120}
        className="h-24 w-24 rounded-full object-cover"
        sizes="(max-width: 768px) 96px, 120px"
      />

      <div className="text-center md:text-left">
        <Heading as="h3" className="font-20 text-brand-primary">
          {name}
        </Heading>
        <Text className="text-sm font-semibold text-brand-primary/80">
          {role}
        </Text>
        <Text className="mt-3 text-base text-brand-primary/80">
          {description}
        </Text>
      </div>
    </article>
  );
}

export default function TeamMembersSection(): JSX.Element {
  return (
    <section className="bg-white py-16">
      <div className="container px-6">
        <Heading as="h2" className="text-center font-28 text-brand-primary">
          Conheça nossa equipe
        </Heading>
        <Text className="mx-auto mt-2 max-w-3xl text-center text-base text-brand-primary/70">
          Profissionais e voluntários que dedicam seus talentos para impulsionar
          a Medicina de Abrigos Brasil e transformar a vida dos animais em todo
          o país.
        </Text>

        <div className="mt-10 flex flex-col gap-6">
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
