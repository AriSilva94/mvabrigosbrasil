import type { VolunteerFaq } from "@/types/volunteer.types";

export const VOLUNTEER_FAQ: VolunteerFaq[] = [
  {
    id: "1",
    question: "Como posso me cadastrar como voluntário?",
    answer: (
      <p>
        Acesse{" "}
        <a
          href="https://wordpress-202441-5056961.cloudwaysapps.com/register?tipo=voluntario"
          className="text-brand-primary underline-offset-4 hover:underline"
        >
          Cadastro de Voluntário
        </a>{" "}
        - Medicina de Abrigos Brasil e veja de forma prática como você pode
        estar realizando seu cadastro. É muito fácil e rápido!
      </p>
    ),
  },
  {
    id: "2",
    question: "Me cadastrei, e agora?",
    answer: (
      <p>
        Uhuuu... Seja bem-vinde a nossa rede de voluntariado! Agora os abrigos
        poderão te encontrar mais facilmente e você ainda pode se candidatar
        para alguma vaga disponível divulgada pelos abrigos cadastrados e ter
        acesso a materiais exclusivos voltados para seu treinamento.
      </p>
    ),
  },
  {
    id: "3",
    question: "Como os abrigos poderão entrar em contato comigo?",
    answer: (
      <p>
        Os responsáveis dos abrigos cadastrados na plataforma, apenas quando
        estiverem logados, terão acesso as informações completas dos voluntários
        disponíveis ou que se inscreveram para as vagas divulgadas pelo
        respectivo abrigo, conforme nossa{" "}
        <a
          href="https://wordpress-202441-5056961.cloudwaysapps.com/politica-de-privacidade"
          className="text-brand-primary underline-offset-4 hover:underline"
        >
          Política de Privacidade
        </a>
        . O banco de dados dos voluntários disponíveis na área não-logada e na
        área logada de voluntários será mostrado apenas os seguintes dados:
        nome, cidade, estado, experiência e habilidades.
      </p>
    ),
  },
  {
    id: "4",
    question: "O que é o trabalho voluntário?",
    answer: (
      <p>
        De acordo com a Lei Federal nº 9.608/98, o trabalho voluntário é
        definido como a atividade não remunerada prestada por pessoa física a
        entidades públicas de qualquer natureza ou instituições privadas de fins
        não lucrativos que tenham objetivos cívicos, culturais, educacionais,
        científicos, recreativos ou de assistência às pessoas. O trabalho
        voluntário não caracteriza vínculo empregatício e, portanto, não é
        regido pela Consolidação das Leis do Trabalho (CLT). Isso significa que
        o voluntário não tem os mesmos direitos que são garantidos, por lei,
        para os empregados de uma empresa.
      </p>
    ),
  },
  {
    id: "5",
    question: "Quem pode se cadastrar como voluntário? Tem alguma exigência?",
    answer: (
      <p>
        Qualquer pessoa pode ser voluntária, basta ter motivação e espírito
        solidário para doar talento, tempo e trabalho para causas sociais e
        comunitárias, por vontade própria e sem receber remuneração. O trabalho
        voluntário exige o mesmo grau de responsabilidade exigido em uma
        empresa. Para trabalhos voluntários é essencial ter características de
        uma pessoa engajada, altruísta, assídua, disciplinada, pontual, ter boa
        vontade, paciência, prontidão, espírito de equipe e agir conforme os
        princípios da ONG.
      </p>
    ),
  },
  {
    id: "6",
    question: "Qual a importância dos treinamentos disponíveis para os voluntários?",
    answer: (
      <p>
        O propósito dos treinamentos é de capacitar os voluntários cadastrados
        para uma melhor atuação nos abrigos, seguindo os princípios e diretrizes
        da Medicina de Abrigos
      </p>
    ),
  },
  {
    id: "7",
    question:
      "Fui aceito/chamado para ser voluntário em um abrigo. O que devo saber antes de iniciar meu trabalho?",
    answer: (
      <p>
        É essencial que haja conhecimento sobre o voluntariado, os direitos e
        deveres como voluntário e as possibilidades de realizar este tipo de
        ação. É importante ainda conhecer o histórico do abrigo, a sua visão e
        missão; os funcionários e gestores; a estrutura física e os protocolos
        existentes. Ao conhecer o cenário e o universo no qual estará inserido,
        você estará preparado para uma melhor atuação. Acesse nosso{" "}
        <a
          href="https://wordpress-202441-5056961.cloudwaysapps.com/guias-manuais/guia-do-voluntariado-digital/"
          className="text-brand-primary underline-offset-4 hover:underline"
        >
          Guia do voluntariado
        </a>{" "}
        e saiba mais
      </p>
    ),
  },
  {
    id: "8",
    question: "Quais os benefícios de ser voluntário de abrigos de animais?",
    answer: (
      <div className="space-y-2">
        <p>
          Especificamente, ser voluntário de um abrigo de animais pode trazer
          alguns benefícios como:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Aprender sobre o comportamento e o manejo saudável dos animais;</li>
          <li>Aprender a educar os animais (adestramento básico);</li>
          <li>Contribuir com o bem-estar das pessoas que trabalham no abrigo;</li>
          <li>Contribuir para o bem-estar dos animais e do ambiente;</li>
          <li>
            Aprender sobre zoonoses, guarda-responsável, saúde única e saúde
            pública;
          </li>
          <li>
            Compreender questões relativas ao direito animal e entender que
            todas as vidas são importantes, independentemente da espécie;
          </li>
          <li>
            Melhorar o humor e reduzir o estresse, contribuindo positivamente na
            saúde emocional;
          </li>
          <li>
            Fazer mais atividade física, pois o acompanhamento no abrigo é um
            estímulo físico e mental e libera hormônios que fazem você se sentir
            bem;
          </li>
          <li>
            Reunir grupos de amigos ou colegas de trabalho e passar um tempo com
            os animais. É uma ótima atividade de ligação que inspira outras
            pessoas a começarem o trabalho voluntário por conta própria;
          </li>
          <li>Construir novas amizades;</li>
          <li>Preparar você para adotar, se tiver esse desejo.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "9",
    question: "Só posso atuar como voluntário em abrigos de animais de forma presencial?",
    answer: (
      <p>
        Nem sempre. Dependendo da atividade a ser desempenhada algumas
        instituições optam por disponibilizar vagas para atuação à distância,
        permitindo que você colabore com a ONG de qualquer lugar do país. Uma
        dica: no campo “Deixe mais comentários que queira compartilhar” do seu
        cadastro, especifique se você está disponível para atuação a distância
        ou presencial.
      </p>
    ),
  },
  {
    id: "10",
    question: "Como posso ajudar na expansão da rede de voluntariado dessa plataforma?",
    answer: (
      <p>
        É muito simples. Cadastre-se, divulgue, compartilhe, agite nossas redes
        sociais e faça parte desse movimento pioneiro no Brasil
      </p>
    ),
  },
];
