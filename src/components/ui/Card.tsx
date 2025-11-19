import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return <div>{children ?? 'TODO: Card'}</div>;
}
