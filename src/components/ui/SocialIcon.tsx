import type { SVGAttributes } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { siFacebook, siInstagram, siWhatsapp } from "simple-icons/icons";

type SocialIconName = "facebook" | "instagram" | "whatsapp";

type SocialIconProps = SVGAttributes<SVGSVGElement> & {
  name: SocialIconName;
  size?: number;
};

const ICONS: Record<SocialIconName, typeof siFacebook> = {
  facebook: siFacebook,
  instagram: siInstagram,
  whatsapp: siWhatsapp,
};

export default function SocialIcon({
  name,
  size = 18,
  className,
  ...rest
}: SocialIconProps) {
  const icon = ICONS[name];
  const mergedClassName = twMerge(clsx("fill-current", className));

  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={mergedClassName}
      {...rest}
    >
      <path d={icon.path} />
    </svg>
  );
}
