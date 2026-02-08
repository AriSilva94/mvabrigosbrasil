"use client";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function OpenCookiePreferencesButton({ className, children }: Props) {
  return (
    <button
      type="button"
      className={`cursor-pointer transition-colors duration-200 ${className ?? ""}`}
      onClick={() => window.dispatchEvent(new Event("open-cookie-preferences"))}
    >
      {children ?? "Configurar cookies"}
    </button>
  );
}
