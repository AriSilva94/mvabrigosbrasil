import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ children, ...rest }: SelectProps) {
  return (
    <select {...rest}>
      {children}
    </select>
  );
}
