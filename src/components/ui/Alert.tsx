import type { JSX, ReactNode } from "react";
import { clsx } from "clsx";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

type AlertVariant = "info" | "warning" | "success" | "error";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
};

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

const variantIcons: Record<AlertVariant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

export default function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps): JSX.Element {
  const Icon = variantIcons[variant];

  return (
    <div
      className={clsx(
        "flex gap-3 rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
