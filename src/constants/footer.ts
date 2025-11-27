type SocialLink = {
  href: string;
  label: string;
  name: "facebook" | "instagram";
};

type PolicyLink = {
  label: string;
  href: string;
};

type InstagramPost = {
  href: string;
  image: string;
  alt: string;
  type: "image" | "video";
};

export const FOOTER_SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://facebook.com/mvabrigosbrasil",
    label: "mvabrigosbrasil",
    name: "facebook",
  },
  {
    href: "https://instagram.com/mvabrigosbrasil",
    label: "mvabrigosbrasil",
    name: "instagram",
  },
];

export const FOOTER_POLICY_LINKS: PolicyLink[] = [
  {
    label: "Compromisso",
    href: "https://mvabrigosbrasil.com.br/compromisso-privacidade",
  },
  {
    label: "Política de Privacidade",
    href: "https://mvabrigosbrasil.com.br/politica-de-privacidade",
  },
  {
    label: "Política de Cookies",
    href: "https://mvabrigosbrasil.com.br/politica-de-cookies",
  },
  {
    label: "Termos de Uso",
    href: "https://mvabrigosbrasil.com.br/termos-de-uso",
  },
  {
    label: "Contato",
    href: "https://mvabrigosbrasil.com.br/contato",
  },
];

export const FOOTER_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    href: "https://www.instagram.com/p/DCq2Tnpv9xc/",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/sb-instagram-feed-images/464723803_510394525165978_1605994392160417694_nfull.webp",
    alt: "Quer trabalhar ou voluntariar em abrigos? Confira nossas vagas no mural.",
    type: "image",
  },
  {
    href: "https://www.instagram.com/p/DClsumPy7Fn/",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/sb-instagram-feed-images/464599865_510394158499348_5819681600558741082_nfull.webp",
    alt: "Aprimore seus conhecimentos com nossa biblioteca técnica.",
    type: "image",
  },
  {
    href: "https://www.instagram.com/p/DCTrKb8ha5p/",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/sb-instagram-feed-images/464673548_510393808499383_3168362966463833654_nfull.webp",
    alt: "Adotar é um ato de gentileza e transforma vidas.",
    type: "image",
  },
  {
    href: "https://www.instagram.com/p/DCGzL_OqgGd/",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/sb-instagram-feed-images/464614647_510393528499411_5876891209074543404_nfull.webp",
    alt: "Seja voluntário e transforme vidas nos abrigos.",
    type: "image",
  },
  {
    href: "https://www.instagram.com/p/DB3dTSINORU/",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/sb-instagram-feed-images/464605454_510389818499782_1588510291067433086_nfull.webp",
    alt: "Homenagem aos animais que não estão mais conosco.",
    type: "image",
  },
  {
    href: "https://www.instagram.com/reel/DByM3h5C26M/",
    image:
      "https://mvabrigosbrasil.com.br/wp-content/uploads/sb-instagram-feed-images/465012938_358766613929187_7567475550252034472_nfull.webp",
    alt: "Desfaça mitos sobre gatos pretos e incentive a adoção.",
    type: "video",
  },
];
