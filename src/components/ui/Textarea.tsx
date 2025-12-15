import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 5, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
      {...props}
      className={clsx(
        "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] placeholder:text-[#a0a6b1] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
        "min-h-[150px] resize-y",
        className,
      )}
    />
  );
  },
);

export default Textarea;
