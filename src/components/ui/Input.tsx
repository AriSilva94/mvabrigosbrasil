import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className={clsx(
        "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-[#4f5464] placeholder:text-[#a0a6b1] outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
        className,
      )}
    />
  );
});

export default Input;
